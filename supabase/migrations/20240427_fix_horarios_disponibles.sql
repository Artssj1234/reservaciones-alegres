
-- Improved function to get available time slots for a date
CREATE OR REPLACE FUNCTION public.obtener_horarios_disponibles(p_negocio_id uuid, p_fecha date, p_duracion_minutos integer)
 RETURNS TABLE(hora_inicio time without time zone, hora_fin time without time zone, disponible boolean, estado text)
 LANGUAGE plpgsql
AS $$
DECLARE
  v_dia_semana TEXT;
  v_intervalo INTERVAL;
BEGIN
  -- Get day of week for the given date
  v_dia_semana := LOWER(trim(to_char(p_fecha, 'day')));
  v_intervalo := (p_duracion_minutos || ' minutes')::INTERVAL;
  
  -- Log for debugging
  RAISE NOTICE 'Obteniendo horarios para negocio: %, fecha: %, día: %, duración: % minutos', 
               p_negocio_id, p_fecha, v_dia_semana, p_duracion_minutos;
  
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
      (bs.base_inicio + ((n + p_duracion_minutos) || ' minutes')::interval)::time as hora_fin
    FROM 
      base_slots bs,
      generate_series(0, 23*60, 15) n -- Generate slots every 15 minutes for more precision
    WHERE 
      (bs.base_inicio + (n || ' minutes')::interval)::time >= bs.base_inicio AND
      (bs.base_inicio + ((n + p_duracion_minutos) || ' minutes')::interval)::time <= bs.base_fin
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
        (s.hora_inicio < bs.block_fin AND s.hora_fin > bs.block_inicio)
    ) AND
    NOT EXISTS (
      SELECT 1 FROM booked_slots bs 
      WHERE 
        (s.hora_inicio < bs.cita_fin AND s.hora_fin > bs.cita_inicio)
    ) as disponible,
    -- Add status information for debugging
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM blocked_slots bs 
        WHERE 
          (s.hora_inicio < bs.block_fin AND s.hora_fin > bs.block_inicio)
      ) THEN 'bloqueado'
      WHEN EXISTS (
        SELECT 1 FROM booked_slots bs 
        WHERE 
          (s.hora_inicio < bs.cita_fin AND s.hora_fin > bs.cita_inicio)
      ) THEN 'reservado'
      ELSE 'disponible'
    END as estado
  FROM 
    slots s
  ORDER BY 
    s.hora_inicio;
END;
$$;
