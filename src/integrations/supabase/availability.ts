
import { supabase } from './base-client';
import { DiaDisponible, HorarioDisponible } from '@/types';
import { format } from 'date-fns';

export const getHorariosDisponibles = async (
  negocioId: string, 
  fecha: string,
  servicioId: string
): Promise<{ success: boolean; message?: string; data?: HorarioDisponible[] }> => {
  if (!negocioId || !fecha) {
    console.error('Error: Se requiere negocioId y fecha');
    return { success: false, message: 'Se requiere negocioId y fecha' };
  }

  if (!servicioId || servicioId.trim() === '') {
    console.error('Error: Se requiere un servicio seleccionado');
    return { success: false, message: 'Selecciona un servicio para ver los horarios disponibles' };
  }

  try {
    console.log(`Consultando horarios para negocio=${negocioId}, fecha=${fecha}, servicio=${servicioId}`);
    
    const { data, error } = await supabase
      .rpc('obtener_horarios_disponibles', {
        p_negocio_id: negocioId,
        p_fecha: fecha,
        p_servicio_id: servicioId
      });

    if (error) {
      console.error('Error al obtener horarios disponibles:', error);
      return { success: false, message: error.message };
    }

    console.log(`Se encontraron ${data?.length || 0} horarios para la fecha ${fecha}`);
    console.log('Detalle de horarios:', data);
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error en getHorariosDisponibles:', error);
    return { 
      success: false, 
      message: 'Error al obtener los horarios disponibles' 
    };
  }
};

export const getDiasDisponibles = async (
  negocioId: string, 
  anio: number, 
  mes: number,
  servicioId: string
): Promise<{ success: boolean; message?: string; data?: DiaDisponible[] }> => {
  if (!negocioId) {
    console.error('Error: Se requiere negocioId');
    return { success: false, message: 'Se requiere negocioId' };
  }

  if (!servicioId || servicioId.trim() === '') {
    console.error('Error: Se requiere un servicio seleccionado');
    return { success: false, message: 'Selecciona un servicio para ver la disponibilidad' };
  }

  try {
    console.log(`Consultando dias disponibles para negocio=${negocioId}, año=${anio}, mes=${mes}, servicio=${servicioId}`);
    
    const { data, error } = await supabase
      .rpc('obtener_dias_disponibles_mes', {
        p_negocio_id: negocioId,
        p_anio: anio,
        p_mes: mes,
        p_servicio_id: servicioId
      });

    if (error) {
      console.error('Error al obtener días disponibles:', error);
      return { success: false, message: error.message };
    }

    // Formatear fechas para el frontend
    const diasFormateados = data?.map(dia => ({
      ...dia,
      fecha: typeof dia.fecha === 'string' ? dia.fecha : format(new Date(dia.fecha), 'yyyy-MM-dd')
    })) || [];

    console.log(`Se encontraron ${diasFormateados.length} días para el mes ${mes}/${anio}`);
    
    return {
      success: true,
      data: diasFormateados
    };
  } catch (error) {
    console.error('Error en getDiasDisponibles:', error);
    return { 
      success: false, 
      message: 'Error al obtener los días disponibles' 
    };
  }
};

export const verificarDisponibilidad = async (
  negocioId: string,
  fecha: string,
  horaInicio: string,
  horaFin: string
): Promise<{ success: boolean; message?: string; disponible?: boolean }> => {
  if (!negocioId || !fecha || !horaInicio || !horaFin) {
    return { success: false, message: 'Faltan datos requeridos' };
  }

  try {
    const { data, error } = await supabase
      .rpc('verificar_disponibilidad', {
        p_negocio_id: negocioId,
        p_fecha: fecha,
        p_hora_inicio: horaInicio,
        p_hora_fin: horaFin
      });

    if (error) {
      console.error('Error al verificar disponibilidad:', error);
      return { success: false, message: error.message };
    }

    return {
      success: true,
      disponible: data
    };
  } catch (error) {
    console.error('Error en verificarDisponibilidad:', error);
    return { 
      success: false, 
      message: 'Error al verificar la disponibilidad' 
    };
  }
};

// Updated to use a direct query with structured parameters instead of rpc
export const crearCitaSegura = async (
  citaData: {
    negocio_id: string,
    nombre_cliente: string,
    telefono_cliente: string,
    servicio_id: string,
    fecha: string,
    hora_inicio: string,
    hora_fin: string
  }
): Promise<{ success: boolean; message?: string; citaId?: string }> => {
  if (!citaData.negocio_id || !citaData.nombre_cliente || !citaData.telefono_cliente || 
      !citaData.servicio_id || !citaData.fecha || !citaData.hora_inicio || !citaData.hora_fin) {
    return { success: false, message: 'Faltan datos requeridos para crear la cita' };
  }

  try {
    // First verify availability
    const disponibilidadResult = await verificarDisponibilidad(
      citaData.negocio_id,
      citaData.fecha,
      citaData.hora_inicio,
      citaData.hora_fin
    );

    if (!disponibilidadResult.success || !disponibilidadResult.disponible) {
      return { 
        success: false, 
        message: 'El horario seleccionado ya no está disponible' 
      };
    }

    // If available, create the appointment
    const { data, error } = await supabase
      .from('citas')
      .insert([{
        negocio_id: citaData.negocio_id,
        nombre_cliente: citaData.nombre_cliente,
        telefono_cliente: citaData.telefono_cliente,
        servicio_id: citaData.servicio_id,
        fecha: citaData.fecha,
        hora_inicio: citaData.hora_inicio,
        hora_fin: citaData.hora_fin,
        estado: 'pendiente'
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error al crear cita:', error);
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Cita creada correctamente',
      citaId: data.id
    };
  } catch (error) {
    console.error('Error en crearCitaSegura:', error);
    return { 
      success: false, 
      message: 'Error al crear la cita' 
    };
  }
};

export const buscarCitasPorTelefono = async (
  telefono: string
): Promise<{ success: boolean; message?: string; citas?: any[] }> => {
  if (!telefono) {
    return { success: false, message: 'Teléfono requerido' };
  }

  try {
    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        nombre_cliente,
        servicios (
          id,
          nombre,
          duracion_minutos
        ),
        negocios (
          id,
          nombre,
          telefono,
          direccion,
          slug
        )
      `)
      .eq('telefono_cliente', telefono)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al buscar citas:', error);
      return { success: false, message: error.message };
    }

    return {
      success: true,
      citas: data || []
    };
  } catch (error) {
    console.error('Error en buscarCitasPorTelefono:', error);
    return { 
      success: false, 
      message: 'Error al buscar las citas' 
    };
  }
};
