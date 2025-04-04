
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { Json } from './types';
import { DiaDisponible, HorarioDisponible } from '@/types';

const SUPABASE_URL = "https://smlaqershlicbckfwyed.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbGFxZXJzaGxpY2Jja2Z3eWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzAzNjgsImV4cCI6MjA1OTE0NjM2OH0.49aBX-fewsh1kGWRyNLSGwwLk0FRTsWVf7cJc10_N7g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Define proper type interfaces for custom functions
export interface LoginResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  role?: string;
  token?: string;
  expires_at?: string;
}

export interface BusinessResponse {
  success: boolean;
  message?: string;
  business?: any;
}

export interface BusinessStatsResponse {
  success: boolean;
  message?: string;
  stats?: {
    citas_hoy: number;
    citas_pendientes: number;
    servicios: number;
    clientes_total: number;
  };
}

// Type guard functions to check if the response has the expected structure
function isLoginResponse(obj: any): obj is LoginResponse {
  return obj && typeof obj === 'object' && 'success' in obj;
}

function isBusinessResponse(obj: any): obj is BusinessResponse {
  return obj && typeof obj === 'object' && 'success' in obj;
}

function isBusinessStatsResponse(obj: any): obj is BusinessStatsResponse {
  return obj && typeof obj === 'object' && 'success' in obj && obj.stats !== undefined;
}

// Custom login function that uses our database function
export const customLogin = async (usuario: string, contrasena: string): Promise<LoginResponse> => {
  console.log('Intentando login con:', usuario, 'y contraseña:', contrasena.replace(/./g, '*'));
  
  // Using as unknown as any to work around TypeScript restrictions until types are updated
  const { data, error } = await supabase.rpc("custom_login" as any, {
    p_username: usuario,
    p_password: contrasena
  });
  
  console.log('Respuesta de login:', { data, error });
  
  if (error) {
    console.error('Error en custom login:', error);
    return { success: false, message: error.message };
  }
  
  // Properly handle the JSON response with type checking
  if (data && typeof data === 'object') {
    if (isLoginResponse(data)) {
      console.log('Login exitoso para:', usuario, 'con rol:', data.role);
      return data;
    } else {
      // Intenta convertir la respuesta genérica a LoginResponse
      const loginResponse = data as unknown as LoginResponse;
      if (loginResponse.success !== undefined) {
        return loginResponse;
      }
    }
  }
  
  console.error('Formato de respuesta inesperado:', data);
  return { success: false, message: 'Error desconocido: formato de respuesta inválido' };
};

// Get business data for a user
export const getBusinessByUserId = async (userId: string): Promise<BusinessResponse> => {
  console.log('Obteniendo datos de negocio para usuario ID:', userId);
  
  // Using as unknown as any to work around TypeScript restrictions until types are updated
  const { data, error } = await supabase.rpc("get_business_by_user_id" as any, {
    p_user_id: userId
  });
  
  console.log('Respuesta de negocio:', { data, error });
  
  if (error) {
    console.error('Error al obtener datos del negocio:', error);
    return { success: false, message: error.message };
  }
  
  // Properly handle the JSON response with type checking
  if (data && typeof data === 'object') {
    if (isBusinessResponse(data)) {
      return data;
    } else {
      // Intenta convertir la respuesta genérica a BusinessResponse
      const businessResponse = data as unknown as BusinessResponse;
      if (businessResponse.success !== undefined) {
        return businessResponse;
      }
    }
  }
  
  console.error('Formato de respuesta inesperado:', data);
  return { success: false, message: 'Error desconocido: formato de respuesta inválido' };
};

// Función para obtener estadísticas del negocio
export const getNegocioStats = async (negocioId: string): Promise<BusinessStatsResponse> => {
  console.log('Obteniendo estadísticas para negocio ID:', negocioId);
  
  // Using as unknown as any to work around TypeScript restrictions until types are updated
  const { data, error } = await supabase.rpc("get_estadisticas_negocio" as any, {
    p_negocio_id: negocioId
  });
  
  if (error) {
    console.error('Error al obtener estadísticas:', error);
    return { success: false, message: error.message };
  }
  
  return { 
    success: true, 
    stats: data as {
      citas_hoy: number;
      citas_pendientes: number;
      servicios: number;
      clientes_total: number;
    }
  };
};

// Funciones para obtener datos de las distintas entidades del negocio
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

// Funciones mejoradas para crear, actualizar y eliminar datos
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

// Funciones similares para citas
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

// Funciones para actualizar el perfil del negocio
export const updateNegocioPerfil = async (id: string, datos: any) => {
  console.log('Actualizando perfil del negocio:', id, datos);
  
  // Using as unknown as any to work around TypeScript restrictions until types are updated
  const { data, error } = await supabase.rpc(
    "update_negocio_profile" as any,
    {
      p_negocio_id: id,
      p_nombre: datos.nombre,
      p_descripcion: datos.descripcion,
      p_direccion: datos.direccion,
      p_telefono: datos.telefono,
      p_correo: datos.correo,
      p_sitio_web: datos.sitio_web
    }
  );
  
  if (error) {
    console.error('Error al actualizar perfil:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

// Actualizar contraseña del usuario
export const updateUserPassword = async (id: string, nuevaContrasena: string) => {
  console.log('Actualizando contraseña para usuario:', id);
  
  const { data, error } = await supabase
    .from('usuarios')
    .update({ contrasena: nuevaContrasena })
    .eq('id', id)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error al actualizar contraseña:', error);
    return { success: false, message: error.message };
  }
  
  return { success: true, data };
};

// Fix 1: Update the function to use specific parameter types instead of Record<string, any>
export const getHorariosDisponibles = async (
  negocioId: string,
  fecha: string,
  servicioId?: string
): Promise<{ success: boolean; message?: string; data: HorarioDisponible[] }> => {
  console.log('Obteniendo horarios disponibles para negocio ID:', negocioId, 'en fecha:', fecha, 'para servicio ID:', servicioId || 'undefined');

  try {
    // Define explicitly typed parameters
    const params: {
      p_negocio_id: string;
      p_fecha: string;
      p_duracion_minutos?: number;
      p_servicio_id?: string;
    } = {
      p_negocio_id: negocioId,
      p_fecha: fecha
    };
    
    // Si tenemos ID de servicio, agregarlo a los parámetros
    if (servicioId && servicioId.trim() !== '') {
      params.p_servicio_id = servicioId;
    } else {
      // Si no hay servicio, usar duración predeterminada de 30 minutos
      params.p_duracion_minutos = 30;
    }
    
    console.log('Parámetros para obtener_horarios_disponibles:', params);
    
    const { data, error } = await supabase.rpc(
      "obtener_horarios_disponibles",
      params
    ) as { data: HorarioDisponible[] | null; error: any };

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

// Fix 2: Update the function to use specific parameter types instead of Record<string, any>
export const getDiasDisponibles = async (
  negocioId: string, 
  anio: number, 
  mes: number, 
  servicioId?: string
): Promise<{ success: boolean; message?: string; data: DiaDisponible[] }> => {
  console.log('Obteniendo días disponibles para negocio ID:', negocioId, 'en año:', anio, 'mes:', mes, 'servicio ID:', servicioId || 'undefined');
  
  try {
    // Define explicitly typed parameters
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
    
    // Solo agregar el servicio_id si está definido
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
    
    
// Obtener información completa de un negocio por su slug (para clientes)
export const getNegocioBySlug = async (slug: string) => {
  console.log('Obteniendo negocio por slug:', slug);
  
  const { data, error } = await supabase
    .from('negocios')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error al obtener negocio por slug:', error);
    return { success: false, message: error.message };
  }
  
  if (!data) {
    return { success: false, message: 'Negocio no encontrado' };
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
