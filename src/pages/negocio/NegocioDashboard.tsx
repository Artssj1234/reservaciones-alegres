
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Scissors, Users, ChevronRight, Share2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getCitasByNegocioId, getServiciosByNegocioId } from '@/integrations/supabase/client';

const NegocioDashboard = () => {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasPendientes: 0,
    totalServicios: 0,
    clientesAtendidos: 0
  });
  const [citasRecientes, setCitasRecientes] = useState<any[]>([]);
  
  const slug = auth.negocio?.slug || 'mi-negocio';
  const shareUrl = `${window.location.origin}/${slug}/cita`;
  const negocioId = auth.negocio?.id;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        if (!negocioId) {
          console.error('No se encontró ID de negocio en la sesión');
          toast({
            title: "Error",
            description: "No se pudo cargar la información del negocio. Intenta iniciar sesión de nuevo.",
            variant: "destructive",
          });
          return;
        }

        // Cargar citas
        const citasResult = await getCitasByNegocioId(negocioId);
        const serviciosResult = await getServiciosByNegocioId(negocioId);
        
        if (citasResult.success && Array.isArray(citasResult.data)) {
          const citas = citasResult.data;
          
          // Filtrar citas para hoy
          const today = new Date().toISOString().split('T')[0];
          const citasHoy = citas.filter(cita => cita.fecha === today).length;
          
          // Citas pendientes
          const citasPendientes = citas.filter(cita => cita.estado === 'pendiente').length;
          
          // Total de clientes atendidos (citas completadas)
          const clientesAtendidos = citas.filter(cita => cita.estado === 'aceptada').length;
          
          // Citas recientes (las últimas 3)
          const recientes = citas
            .sort((a, b) => new Date(b.creada_en || '').getTime() - new Date(a.creada_en || '').getTime())
            .slice(0, 3);
          
          setCitasRecientes(recientes);
          
          // Actualizar stats
          setStats(prev => ({
            ...prev,
            citasHoy,
            citasPendientes,
            clientesAtendidos,
            totalServicios: serviciosResult.success ? serviciosResult.data.length : 0
          }));
        } else {
          console.error('Error al cargar citas:', citasResult.message);
          toast({
            title: "Error",
            description: "No se pudieron cargar las citas. Intenta de nuevo más tarde.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [negocioId, toast]);

  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  const handleQrClick = () => {
    setQrDialogOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    });
  };

  const formatFecha = (fechaStr: string) => {
    try {
      return new Date(fechaStr).toLocaleDateString('es-ES');
    } catch (e) {
      return fechaStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Panel de {auth.negocio?.nombre || 'Negocio'}</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShareClick}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartir enlace
          </Button>
          <Button variant="outline" onClick={handleQrClick}>
            <QrCode className="mr-2 h-4 w-4" />
            Código QR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.citasHoy}</div>
            <p className="text-xs text-muted-foreground">
              Para el día de hoy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.citasPendientes}</div>
            <p className="text-xs text-muted-foreground">
              Esperando aprobación
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalServicios}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/negocio/servicios" className="text-reserva-primary hover:underline">
                Gestionar servicios
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.clientesAtendidos}</div>
            <p className="text-xs text-muted-foreground">
              En total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Citas Recientes</CardTitle>
          <Link to="/negocio/citas">
            <Button variant="ghost" size="sm" className="text-reserva-primary">
              Ver todas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Cargando citas...</div>
          ) : citasRecientes.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No hay citas recientes. 
              <div className="mt-2">
                <Link to="/negocio/citas" className="text-reserva-primary hover:underline">
                  Gestionar citas
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {citasRecientes.map((cita) => (
                <li key={cita.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{cita.nombre_cliente}</p>
                    <p className="text-sm text-gray-500">{cita.servicio || 'Servicio no especificado'}</p>
                    <p className="text-sm text-gray-500">
                      {formatFecha(cita.fecha)} - {cita.hora_inicio}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartir enlace de reservas</DialogTitle>
            <DialogDescription>
              Comparte este enlace con tus clientes para que puedan reservar citas online.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly />
            <Button variant="outline" onClick={handleCopyLink}>Copiar</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código QR para reservas</DialogTitle>
            <DialogDescription>
              Tus clientes pueden escanear este código para reservar citas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center border">
              <QrCode className="w-32 h-32 text-gray-500" />
              <span className="sr-only">Código QR para {shareUrl}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setQrDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NegocioDashboard;
