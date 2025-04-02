
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mock data
const mockSolicitudes = [
  { 
    id: '1', 
    nombre_negocio: 'Peluquería Moderna', 
    nombre_contacto: 'Ana López',
    telefono: '+34612345678',
    correo: 'ana@peluqueriamoderna.com',
    slug: 'peluqueria-moderna',
    estado: 'pendiente',
    mensaje_opcional: 'Ofrecemos servicios de peluquería unisex con las últimas tendencias',
    creada_en: '2023-06-15T10:30:00'
  },
  { 
    id: '2', 
    nombre_negocio: 'Salón de Belleza María', 
    nombre_contacto: 'María Gómez',
    telefono: '+34623456789',
    correo: 'maria@salonbelleza.com',
    slug: 'salon-maria',
    estado: 'pendiente',
    mensaje_opcional: 'Especialistas en tratamientos faciales y corporales',
    creada_en: '2023-06-14T14:15:00'
  },
  { 
    id: '3', 
    nombre_negocio: 'Barbería Clásica', 
    nombre_contacto: 'Carlos Ruiz',
    telefono: '+34634567890',
    correo: 'carlos@barberiaclasica.com',
    slug: 'barberia-clasica',
    estado: 'pendiente',
    mensaje_opcional: 'Barbería tradicional con toque moderno',
    creada_en: '2023-06-13T09:45:00'
  },
  { 
    id: '4', 
    nombre_negocio: 'Centro de Estética Bella', 
    nombre_contacto: 'Laura Martínez',
    telefono: '+34645678901',
    correo: 'laura@centrobella.com',
    slug: 'centro-bella',
    estado: 'aceptado',
    mensaje_opcional: 'Tratamientos de belleza para rostro y cuerpo',
    creada_en: '2023-06-12T16:20:00'
  },
  { 
    id: '5', 
    nombre_negocio: 'Nails & Beauty', 
    nombre_contacto: 'Sofía García',
    telefono: '+34656789012',
    correo: 'sofia@nailsbeauty.com',
    slug: 'nails-beauty',
    estado: 'rechazado',
    mensaje_opcional: 'Especialistas en uñas acrílicas, gel y semipermanente',
    creada_en: '2023-06-11T11:10:00'
  }
];

const AdminSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSolicitudes = solicitudes.filter(sol => 
    sol.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sol.nombre_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sol.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sol.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (solicitud: any) => {
    setSelectedSolicitud(solicitud);
    setDetailsOpen(true);
  };

  const handleAprobar = (id: string) => {
    setSolicitudes(prev => prev.map(sol => 
      sol.id === id ? { ...sol, estado: 'aceptado' } : sol
    ));
    toast({
      title: "Solicitud aprobada",
      description: "La solicitud ha sido aprobada exitosamente.",
    });
    setDetailsOpen(false);
  };

  const handleRechazar = (id: string) => {
    setSolicitudes(prev => prev.map(sol => 
      sol.id === id ? { ...sol, estado: 'rechazado' } : sol
    ));
    toast({
      title: "Solicitud rechazada",
      description: "La solicitud ha sido rechazada.",
    });
    setDetailsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Solicitudes de Registro</h1>
      </div>

      {/* Filtro y búsqueda */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar solicitudes..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline" onClick={() => setSearchTerm('')}>
          Limpiar
        </Button>
      </div>

      {/* Lista de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left">Negocio</th>
                  <th className="py-3 px-4 text-left">Contacto</th>
                  <th className="py-3 px-4 text-left">Fecha</th>
                  <th className="py-3 px-4 text-left">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSolicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No se encontraron solicitudes
                    </td>
                  </tr>
                ) : (
                  filteredSolicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="border-b">
                      <td className="py-3 px-4">{solicitud.nombre_negocio}</td>
                      <td className="py-3 px-4">{solicitud.nombre_contacto}</td>
                      <td className="py-3 px-4">
                        {new Date(solicitud.creada_en).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                          solicitud.estado === 'aceptado' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                          'bg-red-100 text-red-800 hover:bg-red-100'
                        }>
                          {solicitud.estado === 'pendiente' ? 'Pendiente' :
                           solicitud.estado === 'aceptado' ? 'Aceptada' :
                           'Rechazada'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewDetails(solicitud)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {solicitud.estado === 'pendiente' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleAprobar(solicitud.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRechazar(solicitud.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la solicitud</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de registro
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolicitud && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Negocio</h3>
                <p>{selectedSolicitud.nombre_negocio}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Contacto</h3>
                <p>{selectedSolicitud.nombre_contacto}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Teléfono</h3>
                  <p>{selectedSolicitud.telefono}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Correo</h3>
                  <p>{selectedSolicitud.correo}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">URL personalizada</h3>
                <p>app.com/{selectedSolicitud.slug}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Mensaje</h3>
                <p className="text-gray-600">{selectedSolicitud.mensaje_opcional || "Sin mensaje"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Estado actual</h3>
                <Badge className={
                  selectedSolicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                  selectedSolicitud.estado === 'aceptado' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                  'bg-red-100 text-red-800 hover:bg-red-100'
                }>
                  {selectedSolicitud.estado === 'pendiente' ? 'Pendiente' :
                    selectedSolicitud.estado === 'aceptado' ? 'Aceptada' :
                    'Rechazada'}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            {selectedSolicitud && selectedSolicitud.estado === 'pendiente' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                  onClick={() => handleRechazar(selectedSolicitud.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAprobar(selectedSolicitud.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSolicitudesPage;
