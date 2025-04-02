
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User2, Calendar, Building, CheckSquare, XSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // En una implementación real, estos datos vendrían de Supabase
  const stats = {
    totalNegocios: 24,
    solicitudesPendientes: 5,
    citasPendientes: 18,
    citasHoy: 32
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negocios Registrados</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNegocios}</div>
            <p className="text-xs text-muted-foreground">
              Negocios activos en la plataforma
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <User2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.solicitudesPendientes}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/admin/solicitudes" className="text-reserva-primary hover:underline">
                Ver solicitudes
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.citasPendientes}</div>
            <p className="text-xs text-muted-foreground">
              En espera de aprobación
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.citasHoy}</div>
            <p className="text-xs text-muted-foreground">
              En todos los negocios
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                { id: '1', nombre: 'Peluquería Moderna', fecha: '2023-06-15', estado: 'pendiente' },
                { id: '2', nombre: 'Salón de Belleza María', fecha: '2023-06-14', estado: 'pendiente' },
                { id: '3', nombre: 'Barbería Clásica', fecha: '2023-06-13', estado: 'pendiente' },
              ].map((solicitud) => (
                <li key={solicitud.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{solicitud.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(solicitud.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {solicitud.estado === 'pendiente' ? (
                      <>
                        <button className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                          <CheckSquare className="h-5 w-5" />
                        </button>
                        <button className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                          <XSquare className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Procesada</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link to="/admin/solicitudes" className="text-sm text-reserva-primary hover:underline">
                Ver todas las solicitudes
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Últimas Citas */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                { id: '1', cliente: 'Juan Pérez', negocio: 'Peluquería Moderna', fecha: '2023-06-15', hora: '10:00', estado: 'pendiente' },
                { id: '2', cliente: 'María Gómez', negocio: 'Salón de Belleza María', fecha: '2023-06-15', hora: '11:30', estado: 'aceptada' },
                { id: '3', cliente: 'Carlos Ruiz', negocio: 'Barbería Clásica', fecha: '2023-06-15', hora: '16:00', estado: 'pendiente' },
              ].map((cita) => (
                <li key={cita.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{cita.cliente}</p>
                    <p className="text-sm text-gray-500">{cita.negocio}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(cita.fecha).toLocaleDateString('es-ES')} - {cita.hora}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                      cita.estado === 'aceptada' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {cita.estado === 'pendiente' ? 'Pendiente' : 
                       cita.estado === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link to="/admin/citas" className="text-sm text-reserva-primary hover:underline">
                Ver todas las citas
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
