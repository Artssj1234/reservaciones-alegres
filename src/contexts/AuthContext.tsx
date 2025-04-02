
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, Usuario, Negocio } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
        setAuth(JSON.parse(storedAuth));
      } catch (error) {
        console.error('Error al parsear datos de autenticación:', error);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  // Login usando nuestra tabla personalizada de usuarios
  const login = async (usuario: string, contrasena: string): Promise<boolean> => {
    try {
      // Consultar la tabla de usuarios personalizada
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuario)
        .eq('contrasena', contrasena)
        .single();

      if (error || !data) {
        console.error('Error de autenticación:', error);
        return false;
      }

      const usuarioAutenticado: Usuario = data;

      let negocioData: Negocio | null = null;

      // Si es un usuario de tipo negocio, obtenemos los datos del negocio
      if (usuarioAutenticado.rol === 'negocio') {
        const { data: negocioResult, error: negocioError } = await supabase
          .from('negocios')
          .select('*')
          .eq('usuario_id', usuarioAutenticado.id)
          .single();

        if (negocioError) {
          console.error('Error al obtener datos del negocio:', negocioError);
        } else if (negocioResult) {
          negocioData = negocioResult;
        }
      }

      const newAuth: AuthState = {
        isAuthenticated: true,
        usuario: usuarioAutenticado,
        negocio: negocioData,
      };

      setAuth(newAuth);
      localStorage.setItem('auth', JSON.stringify(newAuth));
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      usuario: null,
      negocio: null,
    });
    localStorage.removeItem('auth');
  };

  const updateNegocio = (negocio: Negocio) => {
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
