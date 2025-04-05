import { supabase } from './base-client';

// Type definitions
export interface LoginResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  role?: string;
  token?: string;
  expires_at?: string;
}

// Type guard function to check if the response has the expected structure
function isLoginResponse(obj: any): obj is LoginResponse {
  return obj && typeof obj === 'object' && 'success' in obj;
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

// Other auth-related functions can be added here
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
