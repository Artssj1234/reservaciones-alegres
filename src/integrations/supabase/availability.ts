
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
    // Preparar parámetros para la función RPC
    const params: { 
      p_negocio_id: string; 
      p_fecha: string; 
      p_servicio_id?: string;
    } = {
      p_negocio_id: negocioId,
      p_fecha: fechaStr
    };
    
    // Agregar servicio_id si se proporciona
    if (servicioId && servicioId.trim() !== '') {
      params.p_servicio_id = servicioId;
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
    
    return { success: true, disponible: !!data };
  } catch (err) {
    console.error('Error en verificarDisponibilidad:', err);
    return { success: false, message: 'Error al procesar la solicitud', disponible: false };
  }
};

/**
 * Creates a new appointment with double-checking availability
 * @param citaData Appointment data
 * @returns Result of creating the appointment
 */
export const crearCitaSegura = async (citaData: {
  negocio_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}): Promise<{ success: boolean; message?: string; cita_id?: string }> => {
  console.log('Creando cita segura:', citaData);
  
  try {
    const { data, error } = await supabase.rpc(
      "crear_cita_segura",
      {
        p_negocio_id: citaData.negocio_id,
        p_cliente_nombre: citaData.nombre_cliente,
        p_cliente_telefono: citaData.telefono_cliente,
        p_servicio_id: citaData.servicio_id,
        p_fecha: citaData.fecha,
        p_hora_inicio: citaData.hora_inicio,
        p_hora_fin: citaData.hora_fin
      }
    );
    
    if (error) {
      console.error('Error al crear cita segura:', error);
      return { success: false, message: error.message || 'Error al crear la cita' };
    }
    
    if (data && data.success) {
      return { 
        success: true, 
        message: data.message || 'Cita creada correctamente',
        cita_id: data.cita_id
      };
    } else {
      return { 
        success: false, 
        message: data?.message || 'No se pudo crear la cita' 
      };
    }
  } catch (err) {
    console.error('Error en crearCitaSegura:', err);
    return { success: false, message: 'Error al procesar la solicitud' };
  }
};
