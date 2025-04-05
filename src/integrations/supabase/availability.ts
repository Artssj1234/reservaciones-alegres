import { supabase } from './base-client';
import { DiaDisponible, HorarioDisponible } from '@/types';

/**
 * Obtiene los horarios disponibles para un negocio en una fecha específica
 * @param negocioId ID del negocio
 * @param fecha Fecha en formato YYYY-MM-DD o un objeto Date
 * @param servicioId ID del servicio (opcional)
 * @returns Un objeto con los horarios disponibles
 */
export const getHorariosDisponibles = async (
  negocioId: string,
  fecha: string | Date,
  servicioId?: string
): Promise<{ success: boolean; message?: string; data: HorarioDisponible[] }> => {
  const fechaStr = fecha instanceof Date ? fecha.toISOString().split('T')[0] : fecha;
  
  console.log('Obteniendo horarios disponibles para negocio ID:', negocioId, 'en fecha:', fechaStr, 'para servicio ID:', servicioId || 'undefined');

  try {
    const params: {
      p_negocio_id: string;
      p_fecha: string;
      p_duracion_minutos?: number;
      p_servicio_id?: string;
    } = {
      p_negocio_id: negocioId,
      p_fecha: fechaStr
    };
    
    // ✅ Corregido: solo enviar uno de los dos parámetros
    if (servicioId && servicioId.trim() !== '') {
      params.p_servicio_id = servicioId;
      delete params.p_duracion_minutos;
    } else {
      params.p_duracion_minutos = 30;
      delete params.p_servicio_id;
    }
    
    console.log('Parámetros para obtener_horarios_disponibles:', params);
    
    const { data, error } = await supabase.rpc("obtener_horarios_disponibles", params);

    if (error) {
      console.error('Error al obtener horarios disponibles:', error);
      return { success: false, message: error.message, data: [] };
    }

    const horarios: HorarioDisponible[] = Array.isArray(data) ? data : [];
    
    console.log(`Horarios disponibles recibidos: ${horarios.length} slots`);
    console.log('Disponibles:', horarios.filter(h => h.disponible).length);
    console.log('No disponibles:', horarios.filter(h => !h.disponible).length);

    return { success: true, data: horarios };
  } catch (err) {
    console.error('Error en getHorariosDisponibles:', err);
    return { success: false, message: 'Error al procesar la solicitud', data: [] };
  }
};

/**
 * Obtiene los días disponibles de un mes para un negocio
 * @param negocioId ID del negocio
 * @param anio Año
 * @param mes Mes (1-12)
 * @param servicioId ID del servicio (opcional)
 * @returns Un objeto con los días disponibles
 */
export const getDiasDisponibles = async (
  negocioId: string, 
  anio: number, 
  mes: number, 
  servicioId?: string
): Promise<{ success: boolean; message?: string; data: DiaDisponible[] }> => {
  console.log('Obteniendo días disponibles para negocio ID:', negocioId, 'en año:', anio, 'mes:', mes, 'servicio ID:', servicioId || 'undefined');
  
  try {
    const params: {
      p_negocio_id: string;
      p_anio: number;
      p_mes: number;
      p_servicio_id?: string;
    } = {
      p_negocio_id: negocioId,
      p_anio: anio,
      p_mes: mes
    };
    
    if (servicioId && servicioId.trim() !== '') {
      params.p_servicio_id = servicioId;
    }
    
    console.log('Parámetros para obtener_dias_disponibles_mes:', params);
    
    const { data, error } = await supabase.rpc(
      "obtener_dias_disponibles_mes",
      params
    ) as { data: DiaDisponible[] | null, error: any };
    
    if (error) {
      console.error('Error al obtener días disponibles:', error);
      return { success: false, message: error.message, data: [] };
    }
    
    const dias: DiaDisponible[] = Array.isArray(data) ? data : [];
    
    console.log(`Días disponibles recibidos: ${dias.length}`);
    console.log('Con disponibilidad:', dias.filter(d => d.tiene_disponibilidad).length);
    
    return { success: true, data: dias };
  } catch (err) {
    console.error('Error en getDiasDisponibles:', err);
    return { success: false, message: 'Error al procesar la solicitud', data: [] };
  }
};

/**
 * Checks availability for a specific time slot
 * @param negocioId Business ID
 * @param fecha Date in YYYY-MM-DD format
 * @param horaInicio Start time
 * @param horaFin End time
 * @returns Promise with availability result
 */
export const verificarDisponibilidad = async (
  negocioId: string, 
  fecha: string, 
  horaInicio: string, 
  horaFin: string
): Promise<{ success: boolean; message?: string; disponible: boolean }> => {
  console.log('Verificando disponibilidad para negocio ID:', negocioId, 'fecha:', fecha, 'desde:', horaInicio, 'hasta:', horaFin);
  
  try {
    const { data, error } = await supabase.rpc(
      "verificar_disponibilidad",
      {
        p_negocio_id: negocioId,
        p_fecha: fecha,
        p_hora_inicio: horaInicio,
        p_hora_fin: horaFin
      }
    );
    
    if (error) {
      console.error('Error al verificar disponibilidad:', error);
      return { success: false, message: error.message, disponible: false };
    }
    
    return { success: true, disponible: data || false };
  } catch (err) {
    console.error('Error en verificarDisponibilidad:', err);
    return { success: false, message: 'Error al procesar la solicitud', disponible: false };
  }
};
