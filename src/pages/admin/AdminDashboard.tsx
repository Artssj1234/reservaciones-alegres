
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User2, Calendar, Building, CheckSquare, XSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SolicitudNegocio, Negocio, Cita } from '@/types';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalNegocios: 0,
    solicitudesPendientes: 0,
    citasPendientes: 0,
    citasHoy: 0
  });
  const [recentRequests, setRecentRequests] = useState<SolicitudNegocio[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch count of businesses
      const { count: negociosCount, error: negociosError } = await supabase
        .from('negocios')
        .select('*', { count: 'exact', head: true });

      // Fetch count of pending requests
      const { count: solicitudesCount, error: solicitudesError } = await supabase
        .from('solicitudes_negocio')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      // Fetch recent pending requests
      const { data: recentRequestsData, error: recentRequestsError } = await supabase
        .from('solicitudes_negocio')
        .select('*')
        .eq('estado', 'pendiente')
        .order('creada_en', { ascending: false })
        .limit(3);

      // For the appointments, in a real implementation we would fetch from 'citas' table
      // Here we'll use mock data as it appears the citas table might not be fully set up yet

      setStats({
        totalNegocios: negociosCount || 0,
        solicitudesPendientes: solicitudesCount || 0,
        citasPendientes: 18, // Mock data for now
        citasHoy: 32 // Mock data for now
      });

      if (recentRequestsData) {
        setRecentRequests(recentRequestsData as SolicitudNegocio[]);
      }

      // Mock appointments data
      setRecentAppointments([
        { 
          id: '1', 
          negocio_id: 'mock-id-1',
          nombre_cliente: 'Juan Pérez', 
          telefono_cliente: '+34612345678',
          fecha: '2023-06-15', 
          hora_inicio: '10:00', 
          hora_fin: '11:00',
          servicio_id: 'service-id-1',
          estado: 'pendiente',
          creada_en: '2023-06-14T10:30:00'
        } as Cita,
        { 
          id: '2', 
          negocio_id: 'mock-id-2',
          nombre_cliente: 'María Gómez', 
          telefono_cliente: '+34623456789',
          fecha: '2023-06-15', 
          hora_inicio: '11:30', 
          hora_fin: '12:30',
          servicio_id: 'service-id-2',
          estado: 'aceptada',
          creada_en: '2023-06-14T14:15:00'
        } as Cita,
        { 
          id: '3', 
          negocio_id: 'mock-id-3',
          nombre_cliente: 'Carlos Ruiz', 
          telefono_cliente: '+34634567890',
          fecha: '2023-06-15', 
          hora_inicio: '16:00', 
          hora_fin: '17:00',
          servicio_id: 'service-id-3',
          estado: 'pendiente',
          creada_en: '2023-06-14T09:45:00'
        } as Cita
      ]);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      // Update in Supabase
      await supabase
        .from('solicitudes_negocio')
        .update({ estado: 'aceptado' })
        .eq('id', id);

      // Update local state
      setRecentRequests(prev => 
        prev.map(req => req.id === id ? { ...req, estado: 'aceptado' } : req)
      );
      
      setStats(prev => ({
        ...prev,
        solicitudesPendientes: prev.solicitudesPendientes > 0 ? prev.solicitudesPendientes - 1 : 0
      }));
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      // Update in Supabase
      await supabase
        .from('solicitudes_negocio')
        .update({ estado: 'rechazado' })
        .eq('id', id);

      // Update local state
      setRecentRequests(prev => 
        prev.map(req => req.id === id ? { ...req, estado: 'rechazado' } : req)
      );
      
      setStats(prev => ({
        ...prev,
        solicitudesPendientes: prev.solicitudesPendientes > 0 ? prev.solicitudesPendientes - 1 : 0
      }));
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="inline-block animate-spin rounded-full border-4 border-indigo-600 border-t-transparent h-12 w-12"></div>
      </div>
    );
  }

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
              <Link to="/admin/solicitudes" className="text-indigo-600 hover:underline">
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
            {recentRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No hay solicitudes pendientes</p>
            ) : (
              <ul className="space-y-4">
                {recentRequests.map((solicitud) => (
                  <li key={solicitud.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{solicitud.nombre_negocio}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(solicitud.creada_en).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {solicitud.estado === 'pendiente' ? (
                        <>
                          <button 
                            onClick={() => handleApproveRequest(solicitud.id)}
                            className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                          >
                            <CheckSquare className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(solicitud.id)}
                            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <XSquare className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {solicitud.estado === 'aceptado' ? 'Aceptada' : 'Rechazada'}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link to="/admin/solicitudes" className="text-sm text-indigo-600 hover:underline">
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
              {recentAppointments.map((cita) => (
                <li key={cita.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{cita.nombre_cliente}</p>
                    <p className="text-sm text-gray-500">Negocio ID: {cita.negocio_id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(cita.fecha).toLocaleDateString('es-ES')} - {cita.hora_inicio}
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
              <Link to="/admin/citas" className="text-sm text-indigo-600 hover:underline">
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
