
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { SolicitudNegocio } from '@/types';

const AdminSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudNegocio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudNegocio | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      console.log('Obteniendo solicitudes...');
      const { data, error } = await supabase
        .from('solicitudes_negocio')
        .select('*')
        .order('creada_en', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Solicitudes obtenidas:', data);
      setSolicitudes(data as SolicitudNegocio[]);
      setLoading(false);
    } catch (error: any) {
      console.error('Error al cargar solicitudes:', error.message);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSolicitudes = solicitudes.filter(sol => 
    sol.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sol.nombre_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sol.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sol.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (solicitud: SolicitudNegocio) => {
    setSelectedSolicitud(solicitud);
    setDetailsOpen(true);
  };

  const handleAprobar = async (id: string) => {
    setProcessingId(id);
    try {
      console.log('Aprobando solicitud ID:', id);
      
      // 1. Actualizar estado de la solicitud
      const { error: updateError } = await supabase
        .from('solicitudes_negocio')
        .update({ estado: 'aceptado' })
        .eq('id', id);

      if (updateError) {
        console.error('Error al actualizar solicitud:', updateError);
        throw updateError;
      }

      console.log('Solicitud actualizada correctamente');

      // 2. Esperar un momento para que el trigger se ejecute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Obtener datos de la solicitud actualizada
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitudes_negocio')
        .select('*')
        .eq('id', id)
        .single();

      if (solicitudError || !solicitudData) {
        console.error('Error al obtener solicitud actualizada:', solicitudError);
        throw solicitudError || new Error('No se encontró la solicitud');
      }
      
      console.log('Solicitud actualizada recuperada:', solicitudData);

      // 4. Actualizar interfaz
      setSolicitudes(prev => prev.map(sol => 
        sol.id === id ? { ...sol, estado: 'aceptado' } as SolicitudNegocio : sol
      ));

      toast({
        title: "Solicitud aprobada",
        description: `La solicitud ha sido aprobada exitosamente. El negocio puede iniciar sesión con el usuario: ${solicitudData.usuario}`,
      });
      
      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Error al aprobar solicitud:', error);
      
      // Guardar detalles del error para mostrarlos
      const errorMsg = error.message || "Error desconocido al aprobar la solicitud";
      setErrorDetails(`${errorMsg}\n\nPosible causa: Problemas con Row Level Security (RLS) en las tablas. Por favor, contacta al administrador del sistema.`);
      setShowError(true);
      
      toast({
        title: "Error al aprobar",
        description: "Ha ocurrido un error. Ver detalles para más información.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (id: string) => {
    setProcessingId(id);
    try {
      console.log('Rechazando solicitud ID:', id);
      const { error } = await supabase
        .from('solicitudes_negocio')
        .update({ estado: 'rechazado' })
        .eq('id', id);

      if (error) throw error;

      setSolicitudes(prev => prev.map(sol => 
        sol.id === id ? { ...sol, estado: 'rechazado' } as SolicitudNegocio : sol
      ));
      
      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada.",
      });
      
      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Error al rechazar solicitud:', error);
      toast({
        title: "Error al rechazar",
        description: error.message || "No se pudo rechazar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
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
          {loading ? (
            <div className="py-10 text-center">
              <div className="inline-block animate-spin rounded-full border-4 border-indigo-600 border-t-transparent h-12 w-12 mb-4"></div>
              <p className="text-gray-500">Cargando solicitudes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negocio</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSolicitudes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                      No se encontraron solicitudes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSolicitudes.map((solicitud) => (
                    <TableRow key={solicitud.id}>
                      <TableCell>{solicitud.nombre_negocio}</TableCell>
                      <TableCell>{solicitud.nombre_contacto}</TableCell>
                      <TableCell>
                        {new Date(solicitud.creada_en).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                          solicitud.estado === 'aceptado' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                          'bg-red-100 text-red-800 hover:bg-red-100'
                        }>
                          {solicitud.estado === 'pendiente' ? 'Pendiente' :
                           solicitud.estado === 'aceptado' ? 'Aceptada' :
                           'Rechazada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                                disabled={loading || processingId !== null}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRechazar(solicitud.id)}
                                disabled={loading || processingId !== null}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
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
                <h3 className="font-semibold text-sm text-gray-500">Usuario</h3>
                <p>{selectedSolicitud.usuario || "No especificado"}</p>
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
                  disabled={loading || processingId !== null}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAprobar(selectedSolicitud.id)}
                  disabled={loading || processingId !== null}
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

      {/* Modal de error detallado */}
      <Sheet open={showError} onOpenChange={setShowError}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-red-600">Error al procesar solicitud</SheetTitle>
            <SheetDescription>
              Se encontró un error al procesar la solicitud. A continuación se muestran los detalles técnicos:
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <div className="bg-gray-100 p-4 rounded-md overflow-auto h-64">
              <pre className="whitespace-pre-wrap text-sm">{errorDetails}</pre>
            </div>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-medium">Posibles soluciones:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Verifica que las políticas de seguridad (RLS) en Supabase estén correctamente configuradas.</li>
                <li>Asegúrate de que el usuario tenga permisos suficientes para realizar operaciones de inserción.</li>
                <li>Comprueba que no haya restricciones de unicidad que impidan la operación.</li>
              </ul>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={() => setShowError(false)}>Cerrar</Button>
            <Button variant="outline" onClick={fetchSolicitudes}>Recargar datos</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminSolicitudesPage;
