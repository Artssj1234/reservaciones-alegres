
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, Usuario, Negocio } from '@/types';
import { supabase, customLogin, getBusinessByUserId, LoginResponse, BusinessResponse } from '@/integrations/supabase/client';

interface AuthContextType {
  auth: AuthState;
  login: (usuario: string, contrasena: string) => Promise<boolean>;
  logout: () => void;
  updateNegocio: (negocio: Negocio) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    usuario: null,
    negocio: null,
  });

  // Cargar estado de autenticación desde localStorage al iniciar
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        console.log('Auth cargada desde localStorage:', parsedAuth);
        setAuth(parsedAuth);
      } catch (error) {
        console.error('Error al parsear datos de autenticación:', error);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  // Login usando nuestra función personalizada
  const login = async (usuario: string, contrasena: string): Promise<boolean> => {
    try {
      console.log("Iniciando proceso de login para:", usuario);
      
      const result = await customLogin(usuario, contrasena);
      console.log("Resultado de customLogin:", result);
      
      if (!result.success) {
        console.error('Error de autenticación:', result.message);
        return false;
      }

      // Ensure these properties exist in the result
      if (!result.user_id || !result.role) {
        console.error('Error: Respuesta de login incompleta', result);
        return false;
      }

      const usuarioAutenticado: Usuario = {
        id: result.user_id,
        rol: result.role as 'admin' | 'negocio',
        usuario: usuario,
        contrasena: '',  // No almacenamos la contraseña en el cliente
        creado_en: new Date().toISOString()
      };

      console.log('Usuario autenticado:', usuarioAutenticado);

      let negocioData: Negocio | null = null;

      // Si es un usuario de tipo negocio, obtenemos los datos del negocio
      if (usuarioAutenticado.rol === 'negocio') {
        console.log('Obteniendo datos de negocio para usuario:', result.user_id);
        const businessResult = await getBusinessByUserId(usuarioAutenticado.id);
        console.log('Resultado de getBusinessByUserId:', businessResult);
        
        if (businessResult.success && businessResult.business) {
          negocioData = businessResult.business as Negocio;
          console.log('Datos de negocio obtenidos:', negocioData);
        } else {
          console.error('Error al obtener datos del negocio:', businessResult.message);
        }
      }

      const newAuth: AuthState = {
        isAuthenticated: true,
        usuario: usuarioAutenticado,
        negocio: negocioData,
      };

      console.log('Guardando nueva sesión auth:', newAuth);
      setAuth(newAuth);
      localStorage.setItem('auth', JSON.stringify(newAuth));
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Cerrando sesión');
    setAuth({
      isAuthenticated: false,
      usuario: null,
      negocio: null,
    });
    localStorage.removeItem('auth');
  };

  const updateNegocio = (negocio: Negocio) => {
    console.log('Actualizando datos de negocio:', negocio);
    const newAuth = {
      ...auth,
      negocio
    };
    setAuth(newAuth);
    localStorage.setItem('auth', JSON.stringify(newAuth));
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateNegocio }}>
      {children}
    </AuthContext.Provider>
  );
};
