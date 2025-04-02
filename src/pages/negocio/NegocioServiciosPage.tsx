
import React, { useState } from 'react';
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

// Mock data
const mockServicios = [
  { id: '1', nombre: 'Corte de pelo', duracion_minutos: 30, activo: true },
  { id: '2', nombre: 'Tinte', duracion_minutos: 60, activo: true },
  { id: '3', nombre: 'Peinado', duracion_minutos: 45, activo: true },
  { id: '4', nombre: 'Corte y afeitado', duracion_minutos: 45, activo: false },
  { id: '5', nombre: 'Corte y peinado', duracion_minutos: 60, activo: true }
];

const NegocioServiciosPage = () => {
  const [servicios, setServicios] = useState(mockServicios);
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

  const handleOpenDialog = (servicio: any = null) => {
    if (servicio) {
      setEditingServicio(servicio);
      setFormData({
        id: servicio.id,
        nombre: servicio.nombre,
        duracion_minutos: servicio.duracion_minutos,
        activo: servicio.activo
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingServicio) {
      // Actualizar servicio existente
      setServicios(prev => prev.map(s => 
        s.id === formData.id ? { ...formData } : s
      ));
      toast({
        title: "Servicio actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
    } else {
      // Crear nuevo servicio
      const newServicio = {
        ...formData,
        id: (servicios.length + 1).toString()
      };
      setServicios([...servicios, newServicio]);
      toast({
        title: "Servicio creado",
        description: "El nuevo servicio ha sido añadido correctamente.",
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteServicio = (id: string) => {
    setDeleteServicioId(id);
  };

  const confirmDeleteServicio = () => {
    if (deleteServicioId) {
      setServicios(prev => prev.filter(s => s.id !== deleteServicioId));
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente.",
      });
      setDeleteServicioId(null);
    }
  };

  const handleToggleActivo = (id: string, activo: boolean) => {
    setServicios(prev => prev.map(s => 
      s.id === id ? { ...s, activo: !activo } : s
    ));
    toast({
      title: activo ? "Servicio desactivado" : "Servicio activado",
      description: activo 
        ? "El servicio ya no estará disponible para reservas." 
        : "El servicio ahora está disponible para reservas.",
    });
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
