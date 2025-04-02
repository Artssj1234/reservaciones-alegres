
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, Users, Settings, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  getCitasHoyByNegocioId, 
  getCitasPendientesByNegocioId, 
  getServiciosByNegocioId 
} from '@/integrations/supabase/client';

const NegocioDashboard = () => {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [citasPendientes, setCitasPendientes] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);

  const negocioId = auth.negocio?.id;
  const negocioNombre = auth.negocio?.nombre || 'Mi Negocio';
  const negocioSlug = auth.negocio?.slug || '';
  const shareUrl = `${window.location.origin}/${negocioSlug}/cita`;

  useEffect(() => {
    const cargarDatos = async () => {
      if (!negocioId) {
        console.error('No se encontró ID del negocio en la sesión');
        toast({
          title: "Error",
          description: "No se pudo cargar la información del negocio. Intenta iniciar sesión de nuevo.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Cargar todos los datos de manera paralela
        const [citasHoyResult, citasPendientesResult, serviciosResult] = await Promise.all([
          getCitasHoyByNegocioId(negocioId),
          getCitasPendientesByNegocioId(negocioId),
          getServiciosByNegocioId(negocioId)
        ]);

        if (citasHoyResult.success) {
          setCitasHoy(citasHoyResult.data);
        } else {
          console.error('Error al cargar citas de hoy:', citasHoyResult.message);
        }

        if (citasPendientesResult.success) {
          setCitasPendientes(citasPendientesResult.data);
        } else {
          console.error('Error al cargar citas pendientes:', citasPendientesResult.message);
        }

        if (serviciosResult.success) {
          setServicios(serviciosResult.data);
        } else {
          console.error('Error al cargar servicios:', serviciosResult.message);
        }

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos. Intenta nuevamente más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [negocioId, toast]);

  const formatFecha = (fechaStr: string) => {
    try {
      return new Date(fechaStr).toLocaleDateString('es-ES');
    } catch (error) {
      return fechaStr;
    }
  };

  // Obtener nombre del servicio
  const getNombreServicio = (cita: any) => {
    if (cita.servicios && cita.servicios.nombre) {
      return cita.servicios.nombre;
    }
    return 'Servicio no especificado';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de {negocioNombre}</h1>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>
            Copiar enlace de reservas
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/negocio/perfil">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Link>
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Citas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? '...' : citasHoy.length}</div>
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Para el día de hoy
            </p>
            <Button variant="link" size="sm" className="px-0 mt-2" asChild>
              <Link to="/negocio/citas">
                Gestionar citas
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Citas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? '...' : citasPendientes.length}</div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Esperando aprobación
            </p>
            <Button variant="link" size="sm" className="px-0 mt-2" asChild>
              <Link to="/negocio/citas">
                Ver pendientes
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? '...' : servicios.length}</div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Activos en tu catálogo
            </p>
            <Button variant="link" size="sm" className="px-0 mt-2" asChild>
              <Link to="/negocio/servicios">
                Gestionar servicios
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Atendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? '...' : '0'}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Citas Recientes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Citas Recientes</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link to="/negocio/citas">
                Ver todas
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Cargando citas...</div>
          ) : citasHoy.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left">Cliente</th>
                    <th className="py-3 px-4 text-left">Servicio</th>
                    <th className="py-3 px-4 text-left">Hora</th>
                    <th className="py-3 px-4 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citasHoy.slice(0, 5).map((cita) => (
                    <tr key={cita.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="font-medium">{cita.nombre_cliente}</div>
                        <div className="text-sm text-gray-500">{cita.telefono_cliente}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getNombreServicio(cita)}
                      </td>
                      <td className="py-3 px-4">
                        {cita.hora_inicio} - {cita.hora_fin}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          cita.estado === 'aceptada' ? 'bg-green-100 text-green-800' :
                          cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cita.estado === 'aceptada' ? 'Aceptada' :
                           cita.estado === 'pendiente' ? 'Pendiente' : 'Rechazada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-4">No hay citas recientes.</p>
              <Button asChild>
                <Link to="/negocio/citas">Gestionar citas</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NegocioDashboard;
