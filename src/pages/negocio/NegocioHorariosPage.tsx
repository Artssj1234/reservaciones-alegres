
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
import { PlusCircle, Edit, Trash2, Calendar } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { 
  getHorariosByNegocioId, 
  getHorasBloqueadasByNegocioId,
  createHorario,
  updateHorario,
  deleteHorario,
  createHoraBloqueada,
  updateHoraBloqueada,
  deleteHoraBloqueada
} from '@/integrations/supabase/client';

// Traducción de días de la semana
const diasSemana = [
  { valor: 'lunes', texto: 'Lunes' },
  { valor: 'martes', texto: 'Martes' },
  { valor: 'miércoles', texto: 'Miércoles' },
  { valor: 'jueves', texto: 'Jueves' },
  { valor: 'viernes', texto: 'Viernes' },
  { valor: 'sábado', texto: 'Sábado' },
  { valor: 'domingo', texto: 'Domingo' },
];

const NegocioHorariosPage = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<'horarios' | 'bloqueados'>('horarios');
  const [horarios, setHorarios] = useState<any[]>([]);
  const [horasBloqueadas, setHorasBloqueadas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHorarioDialogOpen, setIsHorarioDialogOpen] = useState(false);
  const [isBloqueadoDialogOpen, setIsBloqueadoDialogOpen] = useState(false);
  const [deleteHorarioId, setDeleteHorarioId] = useState<string | null>(null);
  const [deleteBloqueadoId, setDeleteBloqueadoId] = useState<string | null>(null);
  const [editingHorario, setEditingHorario] = useState<any>(null);
  const [editingBloqueado, setEditingBloqueado] = useState<any>(null);
  
  const [horarioForm, setHorarioForm] = useState({
    id: '',
    dia_semana: 'lunes',
    hora_inicio: '09:00',
    hora_fin: '18:00',
  });
  
  const [bloqueadoForm, setBloqueadoForm] = useState({
    id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '10:00',
    motivo: ''
  });
  
  const { toast } = useToast();
  const negocioId = auth.negocio?.id;

  useEffect(() => {
    const loadData = async () => {
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

        const [horariosResult, horasBloqueadasResult] = await Promise.all([
          getHorariosByNegocioId(negocioId),
          getHorasBloqueadasByNegocioId(negocioId)
        ]);
        
        if (horariosResult.success) {
          setHorarios(horariosResult.data);
        } else {
          console.error('Error al cargar horarios:', horariosResult.message);
          toast({
            title: "Error",
            description: "No se pudieron cargar los horarios. Intenta de nuevo más tarde.",
            variant: "destructive",
          });
        }
        
        if (horasBloqueadasResult.success) {
          setHorasBloqueadas(horasBloqueadasResult.data);
        } else {
          console.error('Error al cargar horas bloqueadas:', horasBloqueadasResult.message);
          toast({
            title: "Error",
            description: "No se pudieron cargar las horas bloqueadas. Intenta de nuevo más tarde.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al cargar datos de horarios:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [negocioId, toast]);

  // Horarios recurrentes
  const handleHorarioDialog = (horario: any = null) => {
    if (horario) {
      setEditingHorario(horario);
      setHorarioForm({
        id: horario.id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin
      });
    } else {
      setEditingHorario(null);
      setHorarioForm({
        id: '',
        dia_semana: 'lunes',
        hora_inicio: '09:00',
        hora_fin: '18:00'
      });
    }
    setIsHorarioDialogOpen(true);
  };

  const handleHorarioChange = (field: string, value: string) => {
    setHorarioForm(prev => ({ ...prev, [field]: value }));
  };

  const handleHorarioSubmit = async (e: React.FormEvent) => {
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
      
      let result;
      
      if (editingHorario) {
        // Actualizar horario existente
        result = await updateHorario(horarioForm.id, {
          dia_semana: horarioForm.dia_semana,
          hora_inicio: horarioForm.hora_inicio,
          hora_fin: horarioForm.hora_fin
        });
        
        if (result.success) {
          setHorarios(prev => prev.map(h => 
            h.id === horarioForm.id ? result.data : h
          ));
          
          toast({
            title: "Horario actualizado",
            description: "Los cambios han sido guardados correctamente.",
          });
        }
      } else {
        // Crear nuevo horario
        const horarioData = {
          negocio_id: negocioId,
          dia_semana: horarioForm.dia_semana,
          hora_inicio: horarioForm.hora_inicio,
          hora_fin: horarioForm.hora_fin
        };
        
        result = await createHorario(horarioData);
        
        if (result.success) {
          setHorarios([...horarios, result.data]);
          toast({
            title: "Horario añadido",
            description: "El nuevo horario ha sido añadido correctamente.",
          });
        }
      }
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.message || "Ha ocurrido un error al guardar el horario.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al guardar horario:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el horario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
    
    setIsHorarioDialogOpen(false);
  };

  const handleDeleteHorario = (id: string) => {
    setDeleteHorarioId(id);
  };

  const confirmDeleteHorario = async () => {
    if (deleteHorarioId) {
      try {
        const result = await deleteHorario(deleteHorarioId);
        
        if (result.success) {
          setHorarios(prev => prev.filter(h => h.id !== deleteHorarioId));
          toast({
            title: "Horario eliminado",
            description: "El horario ha sido eliminado correctamente.",
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Ha ocurrido un error al eliminar el horario.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al eliminar horario:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el horario. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      }
      
      setDeleteHorarioId(null);
    }
  };

  // Horas bloqueadas
  const handleBloqueadoDialog = (bloqueado: any = null) => {
    if (bloqueado) {
      setEditingBloqueado(bloqueado);
      setBloqueadoForm({
        id: bloqueado.id,
        fecha: bloqueado.fecha,
        hora_inicio: bloqueado.hora_inicio,
        hora_fin: bloqueado.hora_fin,
        motivo: bloqueado.motivo || ''
      });
    } else {
      setEditingBloqueado(null);
      setBloqueadoForm({
        id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '09:00',
        hora_fin: '10:00',
        motivo: ''
      });
    }
    setIsBloqueadoDialogOpen(true);
  };

  const handleBloqueadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBloqueadoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBloqueadoSubmit = async (e: React.FormEvent) => {
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
      
      let result;
      
      if (editingBloqueado) {
        // Actualizar hora bloqueada existente
        result = await updateHoraBloqueada(bloqueadoForm.id, {
          fecha: bloqueadoForm.fecha,
          hora_inicio: bloqueadoForm.hora_inicio,
          hora_fin: bloqueadoForm.hora_fin,
          motivo: bloqueadoForm.motivo
        });
        
        if (result.success) {
          setHorasBloqueadas(prev => prev.map(h => 
            h.id === bloqueadoForm.id ? result.data : h
          ));
          
          toast({
            title: "Bloqueo actualizado",
            description: "Los cambios han sido guardados correctamente.",
          });
        }
      } else {
        // Crear nueva hora bloqueada
        const bloqueadoData = {
          negocio_id: negocioId,
          fecha: bloqueadoForm.fecha,
          hora_inicio: bloqueadoForm.hora_inicio,
          hora_fin: bloqueadoForm.hora_fin,
          motivo: bloqueadoForm.motivo
        };
        
        result = await createHoraBloqueada(bloqueadoData);
        
        if (result.success) {
          setHorasBloqueadas([...horasBloqueadas, result.data]);
          toast({
            title: "Bloqueo añadido",
            description: "El nuevo bloqueo horario ha sido añadido correctamente.",
          });
        }
      }
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.message || "Ha ocurrido un error al guardar el bloqueo horario.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al guardar hora bloqueada:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el bloqueo horario. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
    
    setIsBloqueadoDialogOpen(false);
  };

  const handleDeleteBloqueado = (id: string) => {
    setDeleteBloqueadoId(id);
  };

  const confirmDeleteBloqueado = async () => {
    if (deleteBloqueadoId) {
      try {
        const result = await deleteHoraBloqueada(deleteBloqueadoId);
        
        if (result.success) {
          setHorasBloqueadas(prev => prev.filter(h => h.id !== deleteBloqueadoId));
          toast({
            title: "Bloqueo eliminado",
            description: "El bloqueo horario ha sido eliminado correctamente.",
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Ha ocurrido un error al eliminar el bloqueo horario.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error al eliminar hora bloqueada:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el bloqueo horario. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      }
      
      setDeleteBloqueadoId(null);
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Horarios</h1>
      </div>

      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'horarios' ? 'text-reserva-primary border-b-2 border-reserva-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('horarios')}
        >
          Horarios Regulares
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'bloqueados' ? 'text-reserva-primary border-b-2 border-reserva-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('bloqueados')}
        >
          Horas Bloqueadas
        </button>
      </div>

      {/* Horarios Regulares */}
      {activeTab === 'horarios' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Horarios Regulares</CardTitle>
            <Button onClick={() => handleHorarioDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Horario
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Cargando horarios...</div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left">Día</th>
                      <th className="py-3 px-4 text-left">Hora Inicio</th>
                      <th className="py-3 px-4 text-left">Hora Fin</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          No hay horarios configurados
                        </td>
                      </tr>
                    ) : (
                      horarios.map((horario) => (
                        <tr key={horario.id} className="border-b">
                          <td className="py-3 px-4">
                            {diasSemana.find(d => d.valor === horario.dia_semana)?.texto || horario.dia_semana}
                          </td>
                          <td className="py-3 px-4">{horario.hora_inicio}</td>
                          <td className="py-3 px-4">{horario.hora_fin}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleHorarioDialog(horario)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteHorario(horario.id)}
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
      )}

      {/* Horas Bloqueadas */}
      {activeTab === 'bloqueados' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Horas Bloqueadas</CardTitle>
            <Button onClick={() => handleBloqueadoDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Bloquear Horas
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Cargando horas bloqueadas...</div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left">Fecha</th>
                      <th className="py-3 px-4 text-left">Hora Inicio</th>
                      <th className="py-3 px-4 text-left">Hora Fin</th>
                      <th className="py-3 px-4 text-left">Motivo</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horasBloqueadas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          No hay horas bloqueadas
                        </td>
                      </tr>
                    ) : (
                      horasBloqueadas.map((bloqueado) => (
                        <tr key={bloqueado.id} className="border-b">
                          <td className="py-3 px-4">
                            {formatFecha(bloqueado.fecha)}
                          </td>
                          <td className="py-3 px-4">{bloqueado.hora_inicio}</td>
                          <td className="py-3 px-4">{bloqueado.hora_fin}</td>
                          <td className="py-3 px-4">{bloqueado.motivo || '-'}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleBloqueadoDialog(bloqueado)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteBloqueado(bloqueado.id)}
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
      )}

      {/* Dialog para crear/editar horario regular */}
      <Dialog open={isHorarioDialogOpen} onOpenChange={setIsHorarioDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHorario ? 'Editar Horario' : 'Añadir Horario'}</DialogTitle>
            <DialogDescription>
              {editingHorario 
                ? 'Modifica los detalles del horario seleccionado.' 
                : 'Configura un nuevo horario regular para tu negocio.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleHorarioSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dia_semana">Día de la Semana</Label>
              <Select 
                value={horarioForm.dia_semana} 
                onValueChange={(value) => handleHorarioChange('dia_semana', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                  {diasSemana.map(dia => (
                    <SelectItem key={dia.valor} value={dia.valor}>
                      {dia.texto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Inicio</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={horarioForm.hora_inicio}
                  onChange={(e) => handleHorarioChange('hora_inicio', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_fin">Hora Fin</Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={horarioForm.hora_fin}
                  onChange={(e) => handleHorarioChange('hora_fin', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsHorarioDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingHorario ? 'Guardar Cambios' : 'Añadir Horario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar hora bloqueada */}
      <Dialog open={isBloqueadoDialogOpen} onOpenChange={setIsBloqueadoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBloqueado ? 'Editar Bloqueo' : 'Bloquear Horas'}</DialogTitle>
            <DialogDescription>
              {editingBloqueado 
                ? 'Modifica los detalles del bloqueo horario seleccionado.' 
                : 'Bloquea horas específicas para que no estén disponibles para reservas.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBloqueadoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  className="pl-8"
                  value={bloqueadoForm.fecha}
                  onChange={handleBloqueadoChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Inicio</Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  value={bloqueadoForm.hora_inicio}
                  onChange={handleBloqueadoChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_fin">Hora Fin</Label>
                <Input
                  id="hora_fin"
                  name="hora_fin"
                  type="time"
                  value={bloqueadoForm.hora_fin}
                  onChange={handleBloqueadoChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Input
                id="motivo"
                name="motivo"
                value={bloqueadoForm.motivo}
                onChange={handleBloqueadoChange}
                placeholder="Ej: Reunión, descanso, etc."
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsBloqueadoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingBloqueado ? 'Guardar Cambios' : 'Bloquear Horas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar eliminación de horario */}
      <AlertDialog open={!!deleteHorarioId} onOpenChange={() => setDeleteHorarioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El horario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHorario} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar eliminación de hora bloqueada */}
      <AlertDialog open={!!deleteBloqueadoId} onOpenChange={() => setDeleteBloqueadoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El bloqueo horario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBloqueado} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NegocioHorariosPage;
