
import { supabase } from './base-client';

// Type definitions
export interface BusinessResponse {
  success: boolean;
  message?: string;
  business?: any;
  disponible?: boolean;
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

// Type guard functions
function isBusinessResponse(obj: any): obj is BusinessResponse {
  return obj && typeof obj === 'object' && 'success' in obj;
}

function isBusinessStatsResponse(obj: any): obj is BusinessStatsResponse {
  return obj && typeof obj === 'object' && 'success' in obj && obj.stats !== undefined;
}

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

// Actualizar perfil del negocio
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

// Obtener información completa de un negocio por su slug (para clientes)
export const getNegocioBySlug = async (slug: string) => {
  console.log('Obteniendo negocio por slug:', slug);
  const { data, error } = await supabase
    .from("negocios")
    .select(
      `
      *,
      servicios:servicios(*)
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener negocio:", error.message);
    return { success: false, message: error.message };
  }

  if (!data) {
    return { success: false, message: 'Negocio no encontrado' };
  }

  return { success: true, data };
};
