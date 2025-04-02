
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
import { PlusCircle, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { HorarioRecurrente, HoraBloqueada } from '@/types';

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

// Función para validar y transformar los datos de horarios recibidos de Supabase
const validateHorarioRecurrente = (horario: any): HorarioRecurrente | null => {
  // Verificar que dia_semana sea uno de los valores válidos
  if (!horario || !horario.dia_semana || !diasSemana.some(dia => dia.valor === horario.dia_semana)) {
    console.error('Día de semana inválido en horario:', horario);
    return null;
  }
  
  return {
    id: horario.id,
    negocio_id: horario.negocio_id,
    dia_semana: horario.dia_semana as HorarioRecurrente['dia_semana'],
    hora_inicio: horario.hora_inicio,
    hora_fin: horario.hora_fin
  };
};

// Función para validar los datos de horas bloqueadas
const validateHoraBloqueada = (bloqueo: any): HoraBloqueada | null => {
  if (!bloqueo || !bloqueo.fecha || !bloqueo.hora_inicio || !bloqueo.hora_fin) {
    console.error('Datos incompletos en bloqueo horario:', bloqueo);
    return null;
  }
  
  return {
    id: bloqueo.id,
    negocio_id: bloqueo.negocio_id,
    fecha: bloqueo.fecha,
    hora_inicio: bloqueo.hora_inicio,
    hora_fin: bloqueo.hora_fin,
    motivo: bloqueo.motivo || '',
    creado_en: bloqueo.creado_en
  };
};

const NegocioHorariosPage = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<'horarios' | 'bloqueados'>('horarios');
  const [horarios, setHorarios] = useState<HorarioRecurrente[]>([]);
  const [horasBloqueadas, setHorasBloqueadas] = useState<HoraBloqueada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHorario, setIsSavingHorario] = useState(false);
  const [isSavingBloqueado, setIsSavingBloqueado] = useState(false);
  const [isHorarioDialogOpen, setIsHorarioDialogOpen] = useState(false);
  const [isBloqueadoDialogOpen, setIsBloqueadoDialogOpen] = useState(false);
  const [deleteHorarioId, setDeleteHorarioId] = useState<string | null>(null);
  const [deleteBloqueadoId, setDeleteBloqueadoId] = useState<string | null>(null);
  const [editingHorario, setEditingHorario] = useState<HorarioRecurrente | null>(null);
  const [editingBloqueado, setEditingBloqueado] = useState<HoraBloqueada | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [horarioForm, setHorarioForm] = useState({
    id: '',
    dia_semana: 'lunes' as HorarioRecurrente['dia_semana'],
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
          // Validar y filtrar los horarios recurrentes
          const validatedHorarios: HorarioRecurrente[] = [];
          horariosResult.data.forEach((horario: any) => {
            const validHorario = validateHorarioRecurrente(horario);
            if (validHorario) {
              validatedHorarios.push(validHorario);
            }
          });
          setHorarios(validatedHorarios);
        } else {
          console.error('Error al cargar horarios:', horariosResult.message);
          toast({
            title: "Error",
            description: "No se pudieron cargar los horarios. Intenta de nuevo más tarde.",
            variant: "destructive",
          });
        }
        
        if (horasBloqueadasResult.success) {
          // Validar y filtrar las horas bloqueadas
          const validatedBloqueados: HoraBloqueada[] = [];
          horasBloqueadasResult.data.forEach((bloqueo: any) => {
            const validBloqueo = validateHoraBloqueada(bloqueo);
            if (validBloqueo) {
              validatedBloqueados.push(validBloqueo);
            }
          });
          setHorasBloqueadas(validatedBloqueados);
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
  }, [negocioId, toast, refreshTrigger]);

  // Horarios recurrentes
  const handleHorarioDialog = (horario: HorarioRecurrente | null = null) => {
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
      setIsSavingHorario(true);
      
      if (!negocioId) {
        toast({
          title: "Error",
          description: "No se encontró ID de negocio. Intenta iniciar sesión de nuevo.",
          variant: "destructive",
        });
        return;
      }
      
      // Validar el formato de hora
      const horaInicioRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      const horaFinRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      
      if (!horaInicioRegex.test(horarioForm.hora_inicio) || !horaFinRegex.test(horarioForm.hora_fin)) {
        toast({
          title: "Formato inválido",
          description: "El formato de hora debe ser HH:MM (24h).",
          variant: "destructive",
        });
        return;
      }
      
      // Validar que hora inicio sea menor que hora fin
      if (horarioForm.hora_inicio >= horarioForm.hora_fin) {
        toast({
          title: "Error de horario",
          description: "La hora de inicio debe ser anterior a la hora de fin.",
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
          const validatedHorario = validateHorarioRecurrente(result.data);
          if (validatedHorario) {
            setHorarios(prev => prev.map(h => 
              h.id === horarioForm.id ? validatedHorario : h
            ));
            
            toast({
              title: "Horario actualizado",
              description: "Los cambios han sido guardados correctamente.",
            });
          }
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
          const validatedHorario = validateHorarioRecurrente(result.data);
          if (validatedHorario) {
            setHorarios(prev => [...prev, validatedHorario]);
            toast({
              title: "Horario añadido",
              description: "El nuevo horario ha sido añadido correctamente.",
            });
          }
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
    } finally {
      setIsSavingHorario(false);
      setIsHorarioDialogOpen(false);
    }
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
  const handleBloqueadoDialog = (bloqueado: HoraBloqueada | null = null) => {
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

  const handleBloqueadoChange = (field: string, value: string) => {
    setBloqueadoForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBloqueadoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSavingBloqueado(true);
      
      if (!negocioId) {
        toast({
          title: "Error",
          description: "No se encontró ID de negocio. Intenta iniciar sesión de nuevo.",
          variant: "destructive",
        });
        return;
      }
      
      // Validar el formato de hora
      const horaInicioRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      const horaFinRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      
      if (!horaInicioRegex.test(bloqueadoForm.hora_inicio) || !horaFinRegex.test(bloqueadoForm.hora_fin)) {
        toast({
          title: "Formato inválido",
          description: "El formato de hora debe ser HH:MM (24h).",
          variant: "destructive",
        });
        return;
      }
      
      // Validar que hora inicio sea menor que hora fin
      if (bloqueadoForm.hora_inicio >= bloqueadoForm.hora_fin) {
        toast({
          title: "Error de horario",
          description: "La hora de inicio debe ser anterior a la hora de fin.",
          variant: "destructive",
        });
        return;
      }
      
      // Validar fecha
      if (!bloqueadoForm.fecha || new Date(bloqueadoForm.fecha).toString() === 'Invalid Date') {
        toast({
          title: "Fecha inválida",
          description: "Por favor selecciona una fecha válida.",
          variant: "destructive",
        });
        return;
      }
      
      let result;
      console.log("Procesando bloqueo horario:", bloqueadoForm);
      
      if (editingBloqueado) {
        // Actualizar hora bloqueada existente
        result = await updateHoraBloqueada(bloqueadoForm.id, {
          fecha: bloqueadoForm.fecha,
          hora_inicio: bloqueadoForm.hora_inicio,
          hora_fin: bloqueadoForm.hora_fin,
          motivo: bloqueadoForm.motivo
        });
        
        console.log("Respuesta de actualización:", result);
        
        if (result.success) {
          const validBloqueo = validateHoraBloqueada(result.data);
          if (validBloqueo) {
            setHorasBloqueadas(prev => prev.map(h => 
              h.id === bloqueadoForm.id ? validBloqueo : h
            ));
            
            toast({
              title: "Bloqueo actualizado",
              description: "Los cambios han sido guardados correctamente.",
            });
          }
        }
      } else {
        // Crear nueva hora bloqueada
        const bloqueadoData = {
          negocio_id: negocioId,
          fecha: bloqueadoForm.fecha,
          hora_inicio: bloqueadoForm.hora_inicio,
          hora_fin: bloqueadoForm.hora_fin,
          motivo: bloqueadoForm.motivo || null
        };
        
        console.log("Enviando datos de nuevo bloqueo:", bloqueadoData);
        result = await createHoraBloqueada(bloqueadoData);
        console.log("Respuesta de creación:", result);
        
        if (result.success) {
          const validBloqueo = validateHoraBloqueada(result.data);
          if (validBloqueo) {
            setHorasBloqueadas(prev => [...prev, validBloqueo]);
            setRefreshTrigger(prev => prev + 1);
            toast({
              title: "Bloqueo añadido",
              description: "El nuevo bloqueo horario ha sido añadido correctamente.",
            });
          }
        }
      }
      
      if (!result.success) {
        console.error("Error en resultado:", result);
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
    } finally {
      setIsSavingBloqueado(false);
      setIsBloqueadoDialogOpen(false);
    }
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
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) {
        return fechaStr;
      }
      return fecha.toLocaleDateString('es-ES');
    } catch (e) {
      return fechaStr;
    }
  };

  // Función para agrupar horarios por día de la semana
  const horariosPorDia = diasSemana.map(dia => {
    return {
      dia: dia.valor,
      texto: dia.texto,
      franjas: horarios.filter(h => h.dia_semana === dia.valor)
    };
  });
  
  // Función para ordenar horas bloqueadas por fecha más reciente
  const horasBloqueadasOrdenadas = [...horasBloqueadas].sort((a, b) => {
    // Primero comparar por fecha
    const fechaComparacion = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    if (fechaComparacion !== 0) return fechaComparacion;
    
    // Si las fechas son iguales, comparar por hora de inicio
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

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
              Añadir Franja Horaria
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="animate-spin mr-2" />
                <span>Cargando horarios...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {horariosPorDia.map(diaTrabajo => (
                  <div key={diaTrabajo.dia} className="border rounded-md p-4">
                    <h3 className="font-semibold text-lg mb-2">{diaTrabajo.texto}</h3>
                    
                    {diaTrabajo.franjas.length === 0 ? (
                      <p className="text-gray-500 py-2">No hay horarios configurados</p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hora Inicio</TableHead>
                              <TableHead>Hora Fin</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {diaTrabajo.franjas.map((franja) => (
                              <TableRow key={franja.id}>
                                <TableCell>{franja.hora_inicio}</TableCell>
                                <TableCell>{franja.hora_fin}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleHorarioDialog(franja)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteHorario(franja.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
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
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="animate-spin mr-2" />
                <span>Cargando horas bloqueadas...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora Inicio</TableHead>
                      <TableHead>Hora Fin</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {horasBloqueadasOrdenadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                          No hay horas bloqueadas
                        </TableCell>
                      </TableRow>
                    ) : (
                      horasBloqueadasOrdenadas.map((bloqueado) => (
                        <TableRow key={bloqueado.id}>
                          <TableCell>
                            {formatFecha(bloqueado.fecha)}
                          </TableCell>
                          <TableCell>{bloqueado.hora_inicio}</TableCell>
                          <TableCell>{bloqueado.hora_fin}</TableCell>
                          <TableCell>{bloqueado.motivo || '-'}</TableCell>
                          <TableCell className="text-right">
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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
              <Button type="submit" disabled={isSavingHorario}>
                {isSavingHorario ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingHorario ? 'Guardando...' : 'Creando...'}
                  </>
                ) : (
                  editingHorario ? 'Guardar Cambios' : 'Añadir Horario'
                )}
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
                  type="date"
                  className="pl-8"
                  value={bloqueadoForm.fecha}
                  onChange={(e) => handleBloqueadoChange('fecha', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Inicio</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={bloqueadoForm.hora_inicio}
                  onChange={(e) => handleBloqueadoChange('hora_inicio', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_fin">Hora Fin</Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={bloqueadoForm.hora_fin}
                  onChange={(e) => handleBloqueadoChange('hora_fin', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Input
                id="motivo"
                value={bloqueadoForm.motivo}
                onChange={(e) => handleBloqueadoChange('motivo', e.target.value)}
                placeholder="Ej: Reunión, descanso, etc."
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsBloqueadoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingBloqueado}>
                {isSavingBloqueado ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingBloqueado ? 'Guardando...' : 'Bloqueando...'}
                  </>
                ) : (
                  editingBloqueado ? 'Guardar Cambios' : 'Bloquear Horas'
                )}
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
