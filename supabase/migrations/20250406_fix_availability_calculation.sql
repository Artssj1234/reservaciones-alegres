
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
  -- Validación importante: No ejecutar sin ID de servicio (obligatorio)
  IF p_servicio_id IS NULL OR p_servicio_id = '' THEN
    RAISE NOTICE 'Error: No se proporcionó ID de servicio';
    RETURN;
  END IF;

  -- Obtener el día de la semana para la fecha dada (en español, minúsculas)
  v_dia_semana := LOWER(trim(to_char(p_fecha, 'day')));
  
  -- Obtener la duración del servicio (obligatorio)
  SELECT duracion_minutos INTO v_servicio_duracion
  FROM servicios
  WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
  
  -- Si el servicio no existe o no tiene duración, usar el valor por defecto
  v_servicio_duracion := COALESCE(v_servicio_duracion, p_duracion_minutos, 30);
  
  -- Verificar que el servicio tiene duración válida
  IF v_servicio_duracion <= 0 THEN
    RAISE NOTICE 'Error: El servicio no tiene una duración válida';
    RETURN;
  END IF;
  
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
    v_servicio_existe BOOLEAN;
    v_servicio_duracion INTEGER;
BEGIN
    -- Validar que exista el servicio
    SELECT EXISTS(
        SELECT 1 FROM servicios
        WHERE id = p_servicio_id AND negocio_id = p_negocio_id
    ), duracion_minutos INTO v_servicio_existe, v_servicio_duracion
    FROM servicios
    WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
    
    IF NOT v_servicio_existe THEN
        RETURN json_build_object(
            'success', false,
            'message', 'El servicio seleccionado no existe'
        );
    END IF;
    
    -- Validar que el servicio tenga duración configurada
    IF v_servicio_duracion <= 0 OR v_servicio_duracion IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'El servicio seleccionado no tiene duración configurada'
        );
    END IF;
    
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

-- Mejora función para obtener días disponibles en un mes
CREATE OR REPLACE FUNCTION public.obtener_dias_disponibles_mes(
    p_negocio_id UUID, 
    p_anio INTEGER, 
    p_mes INTEGER, 
    p_servicio_id UUID DEFAULT NULL
)
RETURNS TABLE(
    fecha DATE, 
    tiene_disponibilidad BOOLEAN, 
    estado TEXT
) AS $$
DECLARE
    v_inicio_mes DATE;
    v_fin_mes DATE;
    v_servicio_duracion INTEGER;
    v_fecha_temp DATE;
    v_hay_horario BOOLEAN;
    v_hay_slots BOOLEAN;
BEGIN
    -- Validación importante: No ejecutar sin ID de servicio (obligatorio)
    IF p_servicio_id IS NULL OR p_servicio_id = '' THEN
        RAISE NOTICE 'Error: No se proporcionó ID de servicio';
        RETURN;
    END IF;

    -- Calcular primer y último día del mes
    v_inicio_mes := make_date(p_anio, p_mes, 1);
    v_fin_mes := (v_inicio_mes + interval '1 month' - interval '1 day')::DATE;
    
    -- Obtener la duración del servicio seleccionado
    SELECT duracion_minutos INTO v_servicio_duracion
    FROM servicios
    WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
    
    -- Verificar que el servicio tenga duración configurada
    IF v_servicio_duracion <= 0 OR v_servicio_duracion IS NULL THEN
        RAISE NOTICE 'Error: El servicio no tiene una duración válida';
        
        -- Usar valor por defecto si no hay duración configurada
        v_servicio_duracion := 30;
    END IF;
    
    -- Logging para depuración
    RAISE NOTICE 'Buscando disponibilidad para negocio: %, año: %, mes: % (desde % hasta %), servicio: %, duración: %min', 
               p_negocio_id, p_anio, p_mes, v_inicio_mes, v_fin_mes, p_servicio_id, v_servicio_duracion;
    
    -- Recorrer cada día del mes
    v_fecha_temp := v_inicio_mes;
    WHILE v_fecha_temp <= v_fin_mes LOOP
        -- Verificar si este día de la semana tiene horario definido
        SELECT EXISTS(
            SELECT 1 FROM horarios_recurrentes hr
            WHERE hr.negocio_id = p_negocio_id 
            AND hr.dia_semana = LOWER(trim(to_char(v_fecha_temp, 'day')))
        ) INTO v_hay_horario;
        
        -- Si no hay horario para este día, saltar la verificación de slots
        IF NOT v_hay_horario THEN
            fecha := v_fecha_temp;
            tiene_disponibilidad := FALSE;
            estado := 'sin_horario';
            RETURN NEXT;
            
            -- Pasar al siguiente día
            v_fecha_temp := v_fecha_temp + interval '1 day';
            CONTINUE;
        END IF;
        
        -- Verificar si hay slots disponibles para este día
        SELECT EXISTS(
            SELECT 1
            FROM obtener_horarios_disponibles(p_negocio_id, v_fecha_temp, p_servicio_id)
            WHERE disponible = true
        ) INTO v_hay_slots;
        
        fecha := v_fecha_temp;
        tiene_disponibilidad := v_hay_slots;
        
        -- Añadir información de estado
        IF NOT v_hay_horario THEN
            estado := 'sin_horario';
        ELSIF NOT v_hay_slots THEN
            -- Verificar por qué no hay slots
            IF EXISTS (
                SELECT 1 FROM horas_bloqueadas
                WHERE negocio_id = p_negocio_id AND fecha = v_fecha_temp
            ) THEN
                estado := 'bloqueado';
            ELSE
                estado := 'completamente_reservado';
            END IF;
        ELSE
            estado := 'disponible';
        END IF;
        
        RETURN NEXT;
        
        -- Pasar al siguiente día
        v_fecha_temp := v_fecha_temp + interval '1 day';
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;
