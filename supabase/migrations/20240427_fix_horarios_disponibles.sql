

-- Improved function to get available time slots for a date
CREATE OR REPLACE FUNCTION public.obtener_horarios_disponibles(
    p_negocio_id UUID,
    p_fecha DATE,
    p_duracion_minutos INTEGER,
    p_servicio_id UUID DEFAULT NULL
)
RETURNS TABLE(
    hora_inicio TIME WITHOUT TIME ZONE,
    hora_fin TIME WITHOUT TIME ZONE,
    disponible BOOLEAN,
    estado TEXT
) AS $$
DECLARE
  v_dia_semana TEXT;
  v_intervalo INTERVAL;
  v_servicio_duracion INTEGER;
BEGIN
  -- Get day of week for the given date
  v_dia_semana := LOWER(trim(to_char(p_fecha, 'day')));
  
  -- Use the provided duration or get it from the service
  IF p_servicio_id IS NOT NULL THEN
      SELECT duracion_minutos INTO v_servicio_duracion
      FROM servicios
      WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
      
      IF v_servicio_duracion IS NULL THEN
          v_servicio_duracion := p_duracion_minutos;
      END IF;
  ELSE
      v_servicio_duracion := p_duracion_minutos;
  END IF;
  
  v_intervalo := (v_servicio_duracion || ' minutes')::INTERVAL;
  
  -- Log for debugging
  RAISE NOTICE 'Obteniendo horarios para negocio: %, fecha: %, día: %, duración: % minutos', 
               p_negocio_id, p_fecha, v_dia_semana, v_servicio_duracion;
  
  RETURN QUERY
  -- Get all possible time slots for this business on this weekday
  WITH base_slots AS (
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
    -- Generate slots from the base schedules
    SELECT 
      (bs.base_inicio + (n || ' minutes')::interval)::time as hora_inicio,
      (bs.base_inicio + ((n + v_servicio_duracion) || ' minutes')::interval)::time as hora_fin
    FROM 
      base_slots bs,
      generate_series(0, 23*60, 15) n -- Generate slots every 15 minutes for more precision
    WHERE 
      (bs.base_inicio + (n || ' minutes')::interval)::time >= bs.base_inicio AND
      (bs.base_inicio + ((n + v_servicio_duracion) || ' minutes')::interval)::time <= bs.base_fin
  ),
  blocked_slots AS (
    -- Find all blocked slots for this date
    SELECT 
      hb.hora_inicio as block_inicio,
      hb.hora_fin as block_fin
    FROM 
      horas_bloqueadas hb
    WHERE 
      hb.negocio_id = p_negocio_id AND
      hb.fecha = p_fecha
  ),
  booked_slots AS (
    -- Find all booked appointments for this date
    SELECT 
      c.hora_inicio as cita_inicio,
      c.hora_fin as cita_fin
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
    -- Check if slot is available (not blocked, not booked)
    NOT EXISTS (
      SELECT 1 FROM blocked_slots bs 
      WHERE 
        (s.hora_inicio, s.hora_fin) OVERLAPS (bs.block_inicio, bs.block_fin)
    ) AND
    NOT EXISTS (
      SELECT 1 FROM booked_slots bs 
      WHERE 
        (s.hora_inicio, s.hora_fin) OVERLAPS (bs.cita_inicio, bs.cita_fin)
    ) as disponible,
    -- Add status information for debugging
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
      ELSE 'disponible'
    END as estado
  FROM 
    slots s
  ORDER BY 
    s.hora_inicio;
END;
$$;

-- Función para obtener días disponibles en un mes
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
BEGIN
    -- Calculate first and last day of month
    v_inicio_mes := make_date(p_anio, p_mes, 1);
    v_fin_mes := (v_inicio_mes + interval '1 month' - interval '1 day')::DATE;
    
    -- Get the duration of the selected service if provided
    IF p_servicio_id IS NOT NULL THEN
        SELECT duracion_minutos INTO v_servicio_duracion
        FROM servicios
        WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
    ELSE
        v_servicio_duracion := 30; -- Default duration if no service selected
    END IF;
    
    -- Log parameters for debugging
    RAISE NOTICE 'Buscando disponibilidad para negocio: %, año: %, mes: % (desde % hasta %), servicio: %', 
               p_negocio_id, p_anio, p_mes, v_inicio_mes, v_fin_mes, p_servicio_id;
    
    RETURN QUERY
    -- For each day in the month
    WITH dias_mes AS (
        SELECT generate_series(v_inicio_mes, v_fin_mes, '1 day'::interval)::date as fecha
    ),
    dias_con_horario AS (
        -- Find which weekdays have schedules defined
        SELECT 
            dm.fecha,
            LOWER(trim(to_char(dm.fecha, 'day'))) as dia_semana,
            EXISTS (
                SELECT 1 FROM horarios_recurrentes hr
                WHERE hr.negocio_id = p_negocio_id AND hr.dia_semana = LOWER(trim(to_char(dm.fecha, 'day')))
            ) as tiene_horario
        FROM dias_mes dm
    ),
    dias_completamente_bloqueados AS (
        -- Find completely blocked days - days where the entire schedule is blocked
        SELECT 
            dch.fecha
        FROM dias_con_horario dch
        JOIN horarios_recurrentes hr ON 
            hr.negocio_id = p_negocio_id AND 
            hr.dia_semana = LOWER(trim(to_char(dch.fecha, 'day')))
        LEFT JOIN horas_bloqueadas hb ON 
            hb.negocio_id = p_negocio_id AND 
            hb.fecha = dch.fecha AND
            hb.hora_inicio <= hr.hora_inicio AND 
            hb.hora_fin >= hr.hora_fin
        WHERE hb.id IS NOT NULL -- This means entire day schedule is blocked
        GROUP BY dch.fecha
    ),
    dias_sin_slots_disponibles AS (
        -- Days where all time slots are booked or blocked
        SELECT 
            dch.fecha
        FROM dias_con_horario dch
        WHERE dch.tiene_horario
        AND NOT EXISTS (
            SELECT 1
            FROM horarios_recurrentes hr
            WHERE hr.negocio_id = p_negocio_id 
            AND hr.dia_semana = LOWER(trim(to_char(dch.fecha, 'day')))
            AND NOT EXISTS (
                -- Check if this time slot is fully booked or blocked
                SELECT 1
                FROM generate_series(
                    hr.hora_inicio::time, 
                    (hr.hora_fin - v_servicio_duracion * interval '1 minute')::time, 
                    '15 minutes'::interval
                ) slot_inicio
                WHERE NOT EXISTS (
                    -- Check for blocked slots
                    SELECT 1
                    FROM horas_bloqueadas hb
                    WHERE hb.negocio_id = p_negocio_id
                    AND hb.fecha = dch.fecha
                    AND (slot_inicio, slot_inicio + (v_servicio_duracion || ' minutes')::interval) OVERLAPS (hb.hora_inicio, hb.hora_fin)
                )
                AND NOT EXISTS (
                    -- Check for booked appointments
                    SELECT 1
                    FROM citas c
                    WHERE c.negocio_id = p_negocio_id
                    AND c.fecha = dch.fecha
                    AND c.estado IN ('pendiente', 'aceptada')
                    AND (slot_inicio, slot_inicio + (v_servicio_duracion || ' minutes')::interval) OVERLAPS (c.hora_inicio, c.hora_fin)
                )
            )
        )
    )
    SELECT 
        dch.fecha,
        -- A day is available if it has a schedule and is not fully booked or blocked
        (dch.tiene_horario AND dcb.fecha IS NULL AND dssd.fecha IS NULL) as tiene_disponibilidad,
        -- Status information
        CASE
            WHEN NOT dch.tiene_horario THEN 'sin_horario'
            WHEN dcb.fecha IS NOT NULL THEN 'completamente_bloqueado'
            WHEN dssd.fecha IS NOT NULL THEN 'completamente_reservado'
            ELSE 'disponible'
        END as estado
    FROM dias_con_horario dch
    LEFT JOIN dias_completamente_bloqueados dcb ON dch.fecha = dcb.fecha
    LEFT JOIN dias_sin_slots_disponibles dssd ON dch.fecha = dssd.fecha
    ORDER BY dch.fecha;
END;
$$ LANGUAGE plpgsql;
