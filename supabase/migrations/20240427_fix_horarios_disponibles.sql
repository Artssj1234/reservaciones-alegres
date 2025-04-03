
-- Improved function to get available time slots for a date
CREATE OR REPLACE FUNCTION public.obtener_horarios_disponibles(
    p_negocio_id UUID,
    p_fecha DATE,
    p_duracion_minutos INTEGER DEFAULT NULL,
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
          v_servicio_duracion := COALESCE(p_duracion_minutos, 30);
      END IF;
  ELSE
      v_servicio_duracion := COALESCE(p_duracion_minutos, 30);
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
$$ LANGUAGE plpgsql;

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
    v_fecha_temp DATE;
    v_hay_horario BOOLEAN;
    v_hay_slots BOOLEAN;
BEGIN
    -- Calculate first and last day of month
    v_inicio_mes := make_date(p_anio, p_mes, 1);
    v_fin_mes := (v_inicio_mes + interval '1 month' - interval '1 day')::DATE;
    
    -- Get the duration of the selected service if provided
    IF p_servicio_id IS NOT NULL THEN
        SELECT duracion_minutos INTO v_servicio_duracion
        FROM servicios
        WHERE id = p_servicio_id AND negocio_id = p_negocio_id;
    END IF;
    
    v_servicio_duracion := COALESCE(v_servicio_duracion, 30);
    
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
            AND hr.dia_semana = LOWER(trim(to_char(v_fecha_temp, 'day')))
        ) INTO v_hay_horario;
        
        -- Skip checking slots if there's no schedule for this day
        IF NOT v_hay_horario THEN
            fecha := v_fecha_temp;
            tiene_disponibilidad := FALSE;
            estado := 'sin_horario';
            RETURN NEXT;
            
            -- Move to next day
            v_fecha_temp := v_fecha_temp + interval '1 day';
            CONTINUE;
        END IF;
        
        -- Check if there are any available slots for this day
        SELECT EXISTS(
            SELECT 1
            FROM obtener_horarios_disponibles(p_negocio_id, v_fecha_temp, v_servicio_duracion, p_servicio_id)
            WHERE disponible = true
        ) INTO v_hay_slots;
        
        fecha := v_fecha_temp;
        tiene_disponibilidad := v_hay_slots;
        
        -- Add status information
        IF NOT v_hay_horario THEN
            estado := 'sin_horario';
        ELSIF NOT v_hay_slots THEN
            -- Check why there are no slots
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
        
        -- Move to next day
        v_fecha_temp := v_fecha_temp + interval '1 day';
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;
