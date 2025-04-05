
import { supabase } from './base-client';
import { DiaDisponible, HorarioDisponible } from '@/types';

export const getHorariosByNegocioId = async (negocioId: string) => {
  console.log('Obteniendo horarios para negocio ID:', negocioId);
  
  const { data, error } = await supabase
    .from('horarios_recurrentes')
    .select('*')
    .eq('negocio_id', negocioId);
  
  if (error) {
    console.error('Error al obtener horarios:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  return { success: true, data: data || [] };
};

export const getHorasBloqueadasByNegocioId = async (negocioId: string) => {
  console.log('Obteniendo horas bloqueadas para negocio ID:', negocioId);
  
  const { data, error } = await supabase
    .from('horas_bloqueadas')
    .select('*')
    .eq('negocio_id', negocioId);
  
  if (error) {
    console.error('Error al obtener horas bloqueadas:', error);
    return { success: false, message: error.message, data: [] };
  }
  
  return { success: true, data: data || [] };
};

// Funciones para horarios
export const createHorario = async (horario: any) => {
  const { data, error } = await supabase
    .from('horarios_recurrentes')
    .insert(horario)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al crear horario:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

export const updateHorario = async (id: string, horario: any) => {
  const { data, error } = await supabase
    .from('horarios_recurrentes')
    .update(horario)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al actualizar horario:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

export const deleteHorario = async (id: string) => {
  const { error } = await supabase
    .from('horarios_recurrentes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar horario:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true };
};

// Funciones para horas bloqueadas
export const createHoraBloqueada = async (horaBloqueada: any) => {
  const { data, error } = await supabase
    .from('horas_bloqueadas')
    .insert(horaBloqueada)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al crear hora bloqueada:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

export const updateHoraBloqueada = async (id: string, horaBloqueada: any) => {
  const { data, error } = await supabase
    .from('horas_bloqueadas')
    .update(horaBloqueada)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al actualizar hora bloqueada:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

export const deleteHoraBloqueada = async (id: string) => {
  const { error } = await supabase
    .from('horas_bloqueadas')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar hora bloqueada:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true };
};
