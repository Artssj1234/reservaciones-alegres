
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, Usuario, Negocio } from '@/types';

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

  // Mock login - En una implementación real, esto se conectaría a Supabase
  const login = async (usuario: string, contrasena: string): Promise<boolean> => {
    // Simulando una verificación de credenciales
    // En producción, esto sería una llamada a Supabase
    if (usuario === 'admin' && contrasena === 'admin') {
      const adminUser: Usuario = {
        id: '1',
        rol: 'admin',
        usuario: 'admin',
        contrasena: 'admin', // En realidad no almacenaríamos esto en el estado
        creado_en: new Date().toISOString()
      };

      const newAuth: AuthState = {
        isAuthenticated: true,
        usuario: adminUser,
        negocio: null
      };

      setAuth(newAuth);
      localStorage.setItem('auth', JSON.stringify(newAuth));
      return true;
    }

    // Simular login de negocio (en producción sería una consulta a Supabase)
    // Aquí simplemente tenemos un usuario de prueba
    if (usuario === 'negocio' && contrasena === 'negocio') {
      const negocioUser: Usuario = {
        id: '2',
        rol: 'negocio',
        usuario: 'negocio',
        contrasena: 'negocio', // En realidad no almacenaríamos esto en el estado
        creado_en: new Date().toISOString()
      };

      const negocioEntity: Negocio = {
        id: '1',
        usuario_id: '2',
        nombre: 'Peluquería Ejemplo',
        slug: 'peluqueria-ejemplo',
        creado_en: new Date().toISOString()
      };

      const newAuth: AuthState = {
        isAuthenticated: true,
        usuario: negocioUser,
        negocio: negocioEntity
      };

      setAuth(newAuth);
      localStorage.setItem('auth', JSON.stringify(newAuth));
      return true;
    }

    return false;
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
