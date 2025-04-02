
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarRange, User, LogOut, LayoutDashboard, Calendar, Settings, Users, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavLinks = () => {
    if (!auth.isAuthenticated) {
      return (
        <>
          <Link to="/" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
          <Link to="/registro" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <User className="w-5 h-5" />
            <span>Registro</span>
          </Link>
          <Link to="/login" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <LogOut className="w-5 h-5" />
            <span>Iniciar Sesión</span>
          </Link>
        </>
      );
    }

    if (auth.usuario?.rol === 'admin') {
      return (
        <>
          <Link to="/admin" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <LayoutDashboard className="w-5 h-5" />
            <span>Panel</span>
          </Link>
          <Link to="/admin/solicitudes" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <Users className="w-5 h-5" />
            <span>Solicitudes</span>
          </Link>
          <Link to="/admin/citas" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <CalendarRange className="w-5 h-5" />
            <span>Todas las Citas</span>
          </Link>
        </>
      );
    }

    if (auth.usuario?.rol === 'negocio') {
      return (
        <>
          <Link to="/negocio" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <LayoutDashboard className="w-5 h-5" />
            <span>Panel</span>
          </Link>
          <Link to="/negocio/citas" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <Calendar className="w-5 h-5" />
            <span>Citas</span>
          </Link>
          <Link to="/negocio/servicios" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <Settings className="w-5 h-5" />
            <span>Servicios</span>
          </Link>
          <Link to="/negocio/horarios" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <CalendarRange className="w-5 h-5" />
            <span>Horarios</span>
          </Link>
          <Link to="/negocio/perfil" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md">
            <User className="w-5 h-5" />
            <span>Perfil</span>
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="reserva-container">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <CalendarRange className="w-8 h-8 text-reserva-primary" />
              <span className="text-xl font-heading font-semibold text-reserva-dark">Reservaciones Alegres</span>
            </Link>
            
            {auth.isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {auth.usuario?.rol === 'admin' ? 'Administrador' : auth.negocio?.nombre}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <nav className="p-4 space-y-2">
            {renderNavLinks()}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4">
          <div className="reserva-container py-4">
            {children}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="reserva-container">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Reservaciones Alegres. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
