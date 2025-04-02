import React from 'react';
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

const NegocioDashboard = () => {
  const { auth } = useAuth();
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  
  const slug = auth.negocio?.slug || 'mi-negocio';
  const shareUrl = `${window.location.origin}/${slug}/cita`;

  const stats = {
    citasHoy: 5,
    citasPendientes: 8,
    totalServicios: 12,
    clientesAtendidos: 127
  };

  const citasRecientes = [
    { 
      id: '1', 
      cliente: 'Juan Pérez', 
      servicio: 'Corte de pelo',
      fecha: '2023-06-15',
      hora: '10:00',
      estado: 'pendiente'
    },
    { 
      id: '2', 
      cliente: 'María López', 
      servicio: 'Tinte de cabello',
      fecha: '2023-06-15',
      hora: '11:30',
      estado: 'aceptada'
    },
    { 
      id: '3', 
      cliente: 'Carlos Gómez', 
      servicio: 'Corte y afeitado',
      fecha: '2023-06-15',
      hora: '15:00',
      estado: 'pendiente'
    }
  ];

  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  const handleQrClick = () => {
    setQrDialogOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Panel de {auth.negocio?.nombre}</h1>
        
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
            <div className="text-2xl font-bold">{stats.citasHoy}</div>
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
            <div className="text-2xl font-bold">{stats.citasPendientes}</div>
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
            <div className="text-2xl font-bold">{stats.totalServicios}</div>
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
            <div className="text-2xl font-bold">{stats.clientesAtendidos}</div>
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
          <ul className="space-y-4">
            {citasRecientes.map((cita) => (
              <li key={cita.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{cita.cliente}</p>
                  <p className="text-sm text-gray-500">{cita.servicio}</p>
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
