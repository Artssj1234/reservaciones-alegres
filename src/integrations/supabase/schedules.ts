
import { supabase } from './base-client';
import { DiaDisponible, HorarioDisponible, HorarioRecurrente, HoraBloqueada } from '@/types';

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
  
  // Convert numeric day_of_week to text day names for better UI display
  const mappedData = data.map(horario => {
    const diasMap: Record<number, string> = {
      0: 'domingo',
      1: 'lunes',
      2: 'martes',
      3: 'miércoles',
      4: 'jueves',
      5: 'viernes',
      6: 'sábado'
    };
    
    return {
      ...horario,
      dia_semana: diasMap[horario.dia_semana] || 'lunes'
    };
  });
  
  return { success: true, data: mappedData || [] };
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
  // Convert day names to numbers for database storage
  const diasMap: Record<string, number> = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6
  };
  
  const horarioToSave = {
    ...horario,
    dia_semana: diasMap[horario.dia_semana] || 1
  };
  
  const { data, error } = await supabase
    .from('horarios_recurrentes')
    .insert(horarioToSave)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al crear horario:', error);
    return { success: false, message: error.message };
  }
  
  // Convert back to text for the UI
  const diasMapInverse: Record<number, string> = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miércoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sábado'
  };
  
  const formattedData = {
    ...data,
    dia_semana: diasMapInverse[data.dia_semana] || 'lunes'
  };
  
  return { success: true, data: formattedData };
};

export const updateHorario = async (id: string, horario: any) => {
  // Convert day names to numbers for database storage
  const diasMap: Record<string, number> = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6
  };
  
  const horarioToSave = {
    ...horario,
    dia_semana: diasMap[horario.dia_semana] || 1
  };
  
  const { data, error } = await supabase
    .from('horarios_recurrentes')
    .update(horarioToSave)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error al actualizar horario:', error);
    return { success: false, message: error.message };
  }
  
  // Convert back to text for the UI
  const diasMapInverse: Record<number, string> = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miércoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sábado'
  };
  
  const formattedData = {
    ...data,
    dia_semana: diasMapInverse[data.dia_semana] || 'lunes'
  };
  
  return { success: true, data: formattedData };
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
