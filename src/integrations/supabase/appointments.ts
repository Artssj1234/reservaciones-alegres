
import { supabase } from './base-client';

// Get appointments by business ID
export const getCitasByNegocioId = async (negocioId: string) => {
  console.log('Obteniendo citas para negocio ID:', negocioId);
  
  const { data, error } = await supabase
    .from('citas')
    .select(`
      *,
      servicios (nombre, duracion_minutos)
    `)
    .eq('negocio_id', negocioId);
  
  if (error) {
    console.error('Error al obtener citas:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  return { success: true, data: data || [] };
};

export const getCitasPendientesByNegocioId = async (negocioId: string) => {
  console.log('Obteniendo citas pendientes para negocio ID:', negocioId);
  
  const { data, error } = await supabase
    .from('citas')
    .select(`
      *,
      servicios (nombre, duracion_minutos)
    `)
    .eq('negocio_id', negocioId)
    .eq('estado', 'pendiente');
  
  if (error) {
    console.error('Error al obtener citas pendientes:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  return { success: true, data: data || [] };
};

export const getCitasHoyByNegocioId = async (negocioId: string) => {
  console.log('Obteniendo citas de hoy para negocio ID:', negocioId);
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('citas')
    .select(`
      *,
      servicios (nombre, duracion_minutos)
    `)
    .eq('negocio_id', negocioId)
    .eq('fecha', today);
  
  if (error) {
    console.error('Error al obtener citas de hoy:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  return { success: true, data: data || [] };
};

export const updateCita = async (id: string, cita: any) => {
  const { data, error } = await supabase
    .from('citas')
    .update(cita)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al actualizar cita:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

export const createCita = async (cita: any) => {
  const { data, error } = await supabase
    .from('citas')
    .insert(cita)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al crear cita:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

// Función para buscar una cita por teléfono (para que los clientes verifiquen su cita)
export const getCitaByTelefono = async (telefono: string) => {
  console.log('Buscando cita con teléfono:', telefono);
  
  const { data, error } = await supabase
    .from('citas')
    .select(`
      *,
      negocios (nombre, slug),
      servicios (nombre, duracion_minutos)
    `)
    .eq('telefono_cliente', telefono)
    .order('fecha', { ascending: true })
    .limit(5);
  
  if (error) {
    console.error('Error al buscar cita por teléfono:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  return { success: true, data: data || [] };
};
