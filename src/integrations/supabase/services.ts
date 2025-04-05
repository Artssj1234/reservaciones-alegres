
import { supabase } from './base-client';

export const getServiciosByNegocioId = async (negocioId: string) => {
  console.log('Obteniendo servicios para negocio ID:', negocioId);
  
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('negocio_id', negocioId);
  
  if (error) {
    console.error('Error al obtener servicios:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  return { success: true, data: data || [] };
};

export const createServicio = async (servicio: any) => {
  const { data, error } = await supabase
    .from('servicios')
    .insert(servicio)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al crear servicio:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

export const updateServicio = async (id: string, servicio: any) => {
  const { data, error } = await supabase
    .from('servicios')
    .update(servicio)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al actualizar servicio:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

export const deleteServicio = async (id: string) => {
  const { error } = await supabase
    .from('servicios')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar servicio:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true };
};
