
-- Improve obtener_horarios_disponibles function to validate service_id at the beginning
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
  -- Validación inicial: requerir service_id o duración
  IF p_servicio_id IS NULL AND p_duracion_minutos IS NULL THEN
    RAISE NOTICE 'Se requiere un servicio_id o duración para calcular disponibilidad';
    RETURN;
  END IF;

  -- Obtener el día de la semana para la fecha dada (en español, minúsculas)
  v_dia_semana := LOWER(trim(to_char(p_fecha, 'day')));
  
  -- Obtener la duración del servicio o usar el valor predeterminado
  IF p_servicio_id IS NOT NULL THEN
    SELECT duracion_minutos INTO v_servicio_duracion
    FROM servicios
    WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
    
    -- Verificar que el servicio tenga una duración configurada
    IF v_servicio_duracion IS NULL THEN
      RAISE NOTICE 'El servicio seleccionado no tiene una duración configurada';
      RETURN;
    END IF;
  END IF;
  
  v_servicio_duracion := COALESCE(v_servicio_duracion, p_duracion_minutos, 30);
  
  -- Verificar que la duración sea mayor que cero
  IF v_servicio_duracion <= 0 THEN
    RAISE NOTICE 'La duración del servicio debe ser mayor que cero';
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

-- Improve obtener_dias_disponibles_mes to validate service_id at the beginning
CREATE OR REPLACE FUNCTION public.obtener_dias_disponibles_mes(
    p_negocio_id UUID,
    p_anio INTEGER,
    p_mes INTEGER,
    p_servicio_id UUID DEFAULT NULL
)
RETURNS TABLE(
    dia_disponible DATE
) AS $$
DECLARE
    v_inicio_mes DATE;
    v_fin_mes DATE;
    v_servicio_duracion INTEGER;
    v_fecha_temp DATE;
    v_hay_horario BOOLEAN;
    v_hay_slots BOOLEAN;
BEGIN
    -- Validación inicial: requerir service_id
    IF p_servicio_id IS NULL THEN
        RAISE NOTICE 'Se requiere un ID de servicio para calcular disponibilidad';
        RETURN;
    END IF;
    
    -- Verificar que el servicio exista y tenga duración
    SELECT duracion_minutos INTO v_servicio_duracion
    FROM servicios
    WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
    
    IF v_servicio_duracion IS NULL THEN
        RAISE NOTICE 'El servicio seleccionado no existe o no tiene duración configurada';
        RETURN;
    END IF;
    
    -- Verificar que la duración sea mayor que cero
    IF v_servicio_duracion <= 0 THEN
        RAISE NOTICE 'La duración del servicio debe ser mayor que cero';
        RETURN;
    END IF;

    -- Calculate first and last day of month
    v_inicio_mes := make_date(p_anio, p_mes, 1);
    v_fin_mes := (v_inicio_mes + interval '1 month' - interval '1 day')::DATE;
    
    -- Log parameters for debugging
    RAISE NOTICE 'Buscando disponibilidad para negocio: %, año: %, mes: % (desde % hasta %), servicio: %', 
               p_negocio_id, p_anio, p_mes, v_inicio_mes, v_fin_mes, p_servicio_id;
    
    -- Loop through each day in the month
    v_fecha_temp := v_inicio_mes;
    WHILE v_fecha_temp <= v_fin_mes LOOP
        -- Check if this weekday has any schedule defined
        SELECT EXISTS(
            SELECT 1 FROM horarios_recurrentes hr
            WHERE hr.negocio_id = p_negocio_id 
            AND hr.dia_semana = EXTRACT(DOW FROM v_fecha_temp)::int
        ) INTO v_hay_horario;
        
        -- Skip checking slots if there's no schedule for this day
        IF NOT v_hay_horario THEN
            -- Move to next day
            v_fecha_temp := v_fecha_temp + interval '1 day';
            CONTINUE;
        END IF;
        
        -- Check if there are any available slots for this day
        SELECT EXISTS(
            SELECT 1
            FROM obtener_horarios_disponibles(p_negocio_id, v_fecha_temp, p_servicio_id)
            WHERE disponible = true
        ) INTO v_hay_slots;
        
        IF v_hay_slots THEN
            -- If there are available slots, return this day
            dia_disponible := v_fecha_temp;
            RETURN NEXT;
        END IF;
        
        -- Move to next day
        v_fecha_temp := v_fecha_temp + interval '1 day';
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Fix crear_cita_segura function to validate service_id and duration
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
    v_servicio_duracion INTEGER;
BEGIN
    -- Validar que el servicio exista y tenga una duración configurada
    SELECT duracion_minutos INTO v_servicio_duracion
    FROM servicios
    WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
    
    IF v_servicio_duracion IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'El servicio seleccionado no existe o no tiene una duración configurada'
        );
    END IF;
    
    IF v_servicio_duracion <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'message', 'El servicio seleccionado tiene una duración no válida'
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
