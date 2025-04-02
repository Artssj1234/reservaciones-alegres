
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { auth } = useAuth();
  
  if (!auth.isAuthenticated) {
    // No está autenticado, redirigir a login
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && auth.usuario?.rol !== requiredRole) {
    // No tiene el rol requerido
    if (auth.usuario?.rol === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    if (auth.usuario?.rol === 'negocio') {
      return <Navigate to="/negocio" replace />;
    }
    
    // Rol desconocido o no válido, redirigir a la página de inicio
    return <Navigate to="/" replace />;
  }
  
  // Autenticado y con el rol requerido (si se especificó)
  return <>{children}</>;
};

export default ProtectedRoute;
