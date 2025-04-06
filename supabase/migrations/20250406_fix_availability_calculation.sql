
-- Improved function to reliably calculate available time slots 
CREATE OR REPLACE FUNCTION public.obtener_horarios_disponibles(
    p_negocio_id UUID,
    p_fecha DATE,
    p_servicio_id UUID DEFAULT NULL,
    p_duracion_minutos INTEGER DEFAULT NULL
)
RETURNS TABLE(
    hora_inicio TIME WITHOUT TIME ZONE,
    hora_fin TIME WITHOUT TIME ZONE,
    disponible BOOLEAN,
    estado TEXT
) AS $$
DECLARE
  v_dia_semana TEXT;
  v_servicio_duracion INTEGER;
  v_hora_actual TIME;
  v_fecha_actual DATE;
  v_margen_minimo INTERVAL := '2 hours'; -- Margen mínimo para reservas (2 horas)
BEGIN
  -- Obtener el día de la semana para la fecha dada (en español, minúsculas)
  v_dia_semana := LOWER(trim(to_char(p_fecha, 'day')));
  
  -- Obtener la duración del servicio o usar el valor predeterminado
  IF p_servicio_id IS NOT NULL THEN
    SELECT duracion_minutos INTO v_servicio_duracion
    FROM servicios
    WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
  END IF;
  
  v_servicio_duracion := COALESCE(v_servicio_duracion, p_duracion_minutos, 30);
  
  -- Obtener fecha y hora actual
  v_fecha_actual := CURRENT_DATE;
  v_hora_actual := CURRENT_TIME;
  
  -- Logging para depuración
  RAISE NOTICE 'Calculando disponibilidad: negocio=%, fecha=%, día=%, servicio=%, duración=%min',
    p_negocio_id, p_fecha, v_dia_semana, p_servicio_id, v_servicio_duracion;
  
  RETURN QUERY
  -- Obtener todos los posibles slots de tiempo para este negocio en este día de la semana
  WITH base_slots AS (
    -- Obtener los horarios base del negocio para este día de la semana
    SELECT 
      hr.hora_inicio as base_inicio,
      hr.hora_fin as base_fin
    FROM 
      horarios_recurrentes hr
    WHERE 
      hr.negocio_id = p_negocio_id AND
      hr.dia_semana = v_dia_semana
  ),
  slots AS (
    -- Generar slots a partir de los horarios base con la duración correcta
    -- Usamos 15 minutos como intervalo base para generar los slots
    SELECT 
      (bs.base_inicio + (n || ' minutes')::interval)::time AS hora_inicio,
      (bs.base_inicio + ((n + v_servicio_duracion) || ' minutes')::interval)::time AS hora_fin
    FROM 
      base_slots bs,
      generate_series(0, 23*60, 15) n -- Cada 15 minutos para más precisión
    WHERE 
      -- El slot debe estar dentro del horario base
      (bs.base_inicio + (n || ' minutes')::interval)::time >= bs.base_inicio AND
      (bs.base_inicio + ((n + v_servicio_duracion) || ' minutes')::interval)::time <= bs.base_fin AND
      -- Verificar si es hoy, aplicar margen mínimo
      (p_fecha > v_fecha_actual OR 
       (p_fecha = v_fecha_actual AND (bs.base_inicio + (n || ' minutes')::interval)::time > (v_hora_actual + v_margen_minimo)::time))
  ),
  blocked_slots AS (
    -- Encontrar todos los horarios bloqueados para esta fecha
    SELECT 
      hb.hora_inicio AS block_inicio,
      hb.hora_fin AS block_fin
    FROM 
      horas_bloqueadas hb
    WHERE 
      hb.negocio_id = p_negocio_id AND
      hb.fecha = p_fecha
    
    UNION ALL
    
    -- Incluir también bloqueos temporales (si existen)
    SELECT 
      bt.hora_inicio AS block_inicio,
      bt.hora_fin AS block_fin
    FROM 
      bloqueos_temporales bt
    WHERE 
      bt.negocio_id = p_negocio_id AND
      bt.fecha = p_fecha AND
      bt.expira_en > NOW()
  ),
  booked_slots AS (
    -- Encontrar todas las citas programadas para esta fecha
    SELECT 
      c.hora_inicio AS cita_inicio,
      c.hora_fin AS cita_fin
    FROM 
      citas c
    WHERE 
      c.negocio_id = p_negocio_id AND
      c.fecha = p_fecha AND
      c.estado IN ('pendiente', 'aceptada')
  )
  SELECT 
    s.hora_inicio,
    s.hora_fin,
    -- Verificar si el slot está disponible (no bloqueado, no reservado)
    NOT EXISTS (
      SELECT 1 FROM blocked_slots bs 
      WHERE 
        (s.hora_inicio, s.hora_fin) OVERLAPS (bs.block_inicio, bs.block_fin)
    ) AND
    NOT EXISTS (
      SELECT 1 FROM booked_slots bs 
      WHERE 
        (s.hora_inicio, s.hora_fin) OVERLAPS (bs.cita_inicio, bs.cita_fin)
    ) AS disponible,
    -- Agregar información de estado para depuración
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM blocked_slots bs 
        WHERE 
          (s.hora_inicio, s.hora_fin) OVERLAPS (bs.block_inicio, bs.block_fin)
      ) THEN 'bloqueado'
      WHEN EXISTS (
        SELECT 1 FROM booked_slots bs 
        WHERE 
          (s.hora_inicio, s.hora_fin) OVERLAPS (bs.cita_inicio, bs.cita_fin)
      ) THEN 'reservado'
      WHEN p_fecha = v_fecha_actual AND s.hora_inicio <= (v_hora_actual + v_margen_minimo)::time THEN 'pasado'
      ELSE 'disponible'
    END AS estado
  FROM 
    slots s
  ORDER BY 
    s.hora_inicio;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada para verificar disponibilidad antes de crear una cita
CREATE OR REPLACE FUNCTION public.verificar_disponibilidad(
    p_negocio_id UUID,
    p_fecha DATE,
    p_hora_inicio TIME WITHOUT TIME ZONE,
    p_hora_fin TIME WITHOUT TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_disponible BOOLEAN;
  v_dia_semana TEXT;
  v_hay_horario BOOLEAN;
  v_hora_actual TIME;
  v_fecha_actual DATE;
BEGIN
  -- Obtener día de la semana y hora actual
  v_dia_semana := LOWER(trim(to_char(p_fecha, 'day')));
  v_fecha_actual := CURRENT_DATE;
  v_hora_actual := CURRENT_TIME;
  
  -- Logging para depuración
  RAISE NOTICE 'Verificando disponibilidad: negocio=%, fecha=%, día=%, hora_inicio=%, hora_fin=%', 
    p_negocio_id, p_fecha, v_dia_semana, p_hora_inicio, p_hora_fin;
  
  -- Verificar si la fecha/hora ya ha pasado con margen mínimo (2 horas)
  IF p_fecha < v_fecha_actual OR 
     (p_fecha = v_fecha_actual AND p_hora_inicio <= (v_hora_actual + interval '2 hours')::time) THEN
    RAISE NOTICE 'Fecha/hora en el pasado o dentro del margen mínimo';
    RETURN FALSE;
  END IF;
  
  -- Verificar si el negocio tiene horario para este día
  SELECT EXISTS(
    SELECT 1 FROM horarios_recurrentes
    WHERE negocio_id = p_negocio_id
    AND LOWER(dia_semana) = v_dia_semana
    AND hora_inicio <= p_hora_inicio
    AND hora_fin >= p_hora_fin
  ) INTO v_hay_horario;
  
  -- Sin horario para este día, no disponible
  IF NOT v_hay_horario THEN
    RAISE NOTICE 'No hay horario configurado para este día';
    RETURN FALSE;
  END IF;
  
  -- Verificar si hay horas bloqueadas que se superpongan
  SELECT NOT EXISTS(
    SELECT 1 FROM horas_bloqueadas
    WHERE negocio_id = p_negocio_id
    AND fecha = p_fecha
    AND (
      (hora_inicio <= p_hora_inicio AND hora_fin > p_hora_inicio) OR
      (hora_inicio < p_hora_fin AND hora_fin >= p_hora_fin) OR
      (hora_inicio >= p_hora_inicio AND hora_fin <= p_hora_fin)
    )
  ) INTO v_disponible;
  
  -- Si está bloqueado, no disponible
  IF NOT v_disponible THEN
    RAISE NOTICE 'Horario bloqueado';
    RETURN FALSE;
  END IF;
  
  -- Verificar bloqueos temporales
  SELECT NOT EXISTS(
    SELECT 1 FROM bloqueos_temporales
    WHERE negocio_id = p_negocio_id
    AND fecha = p_fecha
    AND expira_en > NOW()
    AND (
      (hora_inicio <= p_hora_inicio AND hora_fin > p_hora_inicio) OR
      (hora_inicio < p_hora_fin AND hora_fin >= p_hora_fin) OR
      (hora_inicio >= p_hora_inicio AND hora_fin <= p_hora_fin)
    )
  ) INTO v_disponible;
  
  -- Si está bloqueado temporalmente, no disponible
  IF NOT v_disponible THEN
    RAISE NOTICE 'Horario con bloqueo temporal';
    RETURN FALSE;
  END IF;
  
  -- Verificar si hay citas que se superpongan
  SELECT NOT EXISTS(
    SELECT 1 FROM citas
    WHERE negocio_id = p_negocio_id
    AND fecha = p_fecha
    AND estado IN ('pendiente', 'aceptada')
    AND (
      (hora_inicio <= p_hora_inicio AND hora_fin > p_hora_inicio) OR
      (hora_inicio < p_hora_fin AND hora_fin >= p_hora_fin) OR
      (hora_inicio >= p_hora_inicio AND hora_fin <= p_hora_fin)
    )
  ) INTO v_disponible;
  
  RAISE NOTICE 'Resultado de verificación: %', v_disponible;
  RETURN v_disponible;
END;
$$ LANGUAGE plpgsql;

-- Función para crear cita con verificación de disponibilidad
CREATE OR REPLACE FUNCTION public.crear_cita_segura(
    p_negocio_id UUID,
    p_cliente_nombre TEXT,
    p_cliente_telefono TEXT,
    p_servicio_id UUID,
    p_fecha DATE,
    p_hora_inicio TIME WITHOUT TIME ZONE,
    p_hora_fin TIME WITHOUT TIME ZONE
)
RETURNS JSON AS $$
DECLARE
    v_disponible BOOLEAN;
    v_cita_id UUID;
BEGIN
    -- Verificar disponibilidad antes de crear
    SELECT verificar_disponibilidad(
        p_negocio_id, 
        p_fecha, 
        p_hora_inicio, 
        p_hora_fin
    ) INTO v_disponible;
    
    IF NOT v_disponible THEN
        RETURN json_build_object(
            'success', false,
            'message', 'El horario seleccionado ya no está disponible'
        );
    END IF;
    
    -- Crear la cita
    INSERT INTO citas (
        negocio_id,
        nombre_cliente,
        telefono_cliente,
        servicio_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado
    ) VALUES (
        p_negocio_id,
        p_cliente_nombre,
        p_cliente_telefono,
        p_servicio_id,
        p_fecha,
        p_hora_inicio,
        p_hora_fin,
        'pendiente'
    ) RETURNING id INTO v_cita_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Cita creada correctamente',
        'cita_id', v_cita_id
    );
END;
$$ LANGUAGE plpgsql;
