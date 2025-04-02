
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://smlaqershlicbckfwyed.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbGFxZXJzaGxpY2Jja2Z3eWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzAzNjgsImV4cCI6MjA1OTE0NjM2OH0.49aBX-fewsh1kGWRyNLSGwwLk0FRTsWVf7cJc10_N7g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Custom login function that uses our database function
export const customLogin = async (usuario: string, contrasena: string) => {
  const { data, error } = await supabase.rpc('custom_login', {
    p_username: usuario,
    p_password: contrasena
  });
  
  if (error) {
    console.error('Error en custom login:', error);
    return { success: false, message: error.message };
  }
  
  return data || { success: false, message: 'Error desconocido' };
};

// Get business data for a user
export const getBusinessByUserId = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_business_by_user_id', {
    p_user_id: userId
  });
  
  if (error) {
    console.error('Error al obtener datos del negocio:', error);
    return { success: false, message: error.message };
  }
  
  return data || { success: false, message: 'Error desconocido' };
};
