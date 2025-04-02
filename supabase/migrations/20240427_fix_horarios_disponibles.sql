
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

