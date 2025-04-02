
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { getServiciosByNegocioId, createServicio, updateServicio, deleteServicio } from '@/integrations/supabase/client';

const NegocioServiciosPage = () => {
  const { auth } = useAuth();
  const [servicios, setServicios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<any>(null);
  const [deleteServicioId, setDeleteServicioId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    duracion_minutos: 30,
    activo: true
  });
  const { toast } = useToast();
  const negocioId = auth.negocio?.id;

  useEffect(() => {
    const loadServicios = async () => {
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

        const result = await getServiciosByNegocioId(negocioId);
        
        if (result.success) {
          // Convertir activo a booleano si no existe
          const serviciosConActivo = result.data.map((servicio: any) => ({
            ...servicio,
            activo: servicio.activo !== undefined ? servicio.activo : true
          }));
          setServicios(serviciosConActivo);
        } else {
          console.error('Error al cargar servicios:', result.message);
          toast({
            title: "Error",
            description: "No se pudieron cargar los servicios. Intenta de nuevo más tarde.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los servicios. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServicios();
  }, [negocioId, toast]);

  const handleOpenDialog = (servicio: any = null) => {
    if (servicio) {
      setEditingServicio(servicio);
      setFormData({
        id: servicio.id,
        nombre: servicio.nombre,
        duracion_minutos: servicio.duracion_minutos,
        activo: servicio.activo !== undefined ? servicio.activo : true
      });
    } else {
      setEditingServicio(null);
      setFormData({
        id: '',
        nombre: '',
        duracion_minutos: 30,
        activo: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'duracion_minutos') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActivoChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, activo: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!negocioId) {
        toast({
          title: "Error",
          description: "No se encontró ID de negocio. Intenta iniciar sesión de nuevo.",
          variant: "destructive",
        });
        return;
      }

      const servicioData = {
        ...formData,
        negocio_id: negocioId
      };
      
      let result;
      
      if (editingServicio) {
        // Actualizar servicio existente
        result = await updateServicio(formData.id, {
          nombre: servicioData.nombre,
          duracion_minutos: servicioData.duracion_minutos,
          activo: servicioData.activo
        });
        
        if (result.success) {
          setServicios(prev => prev.map(s => 
            s.id === formData.id ? result.data : s
          ));
          
          toast({
            title: "Servicio actualizado",
            description: "Los cambios han sido guardados correctamente.",
          });
        }
      } else {
        // Crear nuevo servicio
        const { id, ...newServicioData } = servicioData;
        result = await createServicio(newServicioData);
        
        if (result.success) {
          setServicios([...servicios, result.data]);
          toast({
            title: "Servicio creado",
            description: "El nuevo servicio ha sido añadido correctamente.",
          });
        }
      }
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.message || "Ha ocurrido un error al guardar el servicio.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al guardar servicio:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el servicio. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteServicio = (id: string) => {
    setDeleteServicioId(id);
  };

  const confirmDeleteServicio = async () => {
    if (deleteServicioId) {
      try {
        const result = await deleteServicio(deleteServicioId);
        
        if (result.success) {
          setServicios(prev => prev.filter(s => s.id !== deleteServicioId));
          toast({
            title: "Servicio eliminado",
            description: "El servicio ha sido eliminado correctamente.",
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Ha ocurrido un error al eliminar el servicio.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al eliminar servicio:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el servicio. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      }
      
      setDeleteServicioId(null);
    }
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    try {
      const result = await updateServicio(id, { activo: !activo });
      
      if (result.success) {
        setServicios(prev => prev.map(s => 
          s.id === id ? { ...s, activo: !activo } : s
        ));
        
        toast({
          title: activo ? "Servicio desactivado" : "Servicio activado",
          description: activo 
            ? "El servicio ya no estará disponible para reservas." 
            : "El servicio ahora está disponible para reservas.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Ha ocurrido un error al actualizar el estado del servicio.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al cambiar estado de servicio:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cambiar el estado del servicio. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tus Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Cargando servicios...</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left">Nombre</th>
                    <th className="py-3 px-4 text-left">Duración</th>
                    <th className="py-3 px-4 text-left">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">
                        No hay servicios configurados
                      </td>
                    </tr>
                  ) : (
                    servicios.map((servicio) => (
                      <tr key={servicio.id} className="border-b">
                        <td className="py-3 px-4">
                          <div className="font-medium">{servicio.nombre}</div>
                        </td>
                        <td className="py-3 px-4">
                          {servicio.duracion_minutos} minutos
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={servicio.activo}
                              onCheckedChange={() => handleToggleActivo(servicio.id, servicio.activo)}
                            />
                            <span className={servicio.activo ? 'text-green-600' : 'text-gray-500'}>
                              {servicio.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenDialog(servicio)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteServicio(servicio.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar servicio */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingServicio ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</DialogTitle>
            <DialogDescription>
              {editingServicio 
                ? 'Modifica los detalles del servicio seleccionado.' 
                : 'Completa los detalles para añadir un nuevo servicio.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Servicio</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duracion_minutos">Duración (minutos)</Label>
              <Input
                id="duracion_minutos"
                name="duracion_minutos"
                type="number"
                min="5"
                step="5"
                value={formData.duracion_minutos}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={handleActivoChange}
              />
              <Label htmlFor="activo">Activo (disponible para reservas)</Label>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingServicio ? 'Guardar Cambios' : 'Crear Servicio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog open={!!deleteServicioId} onOpenChange={() => setDeleteServicioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteServicio} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NegocioServiciosPage;
