
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { CalendarRange, Clock, CheckCircle2, ChevronRight, Info, Scissors } from 'lucide-react';
import { 
  getNegocioBySlug,
  getServiciosByNegocioId,
  getHorariosDisponibles,
  getDiasDisponibles,
  createCita,
  getCitaByTelefono
} from '@/integrations/supabase/client';
import { HorarioDisponible, DiaDisponible } from '@/types';
import { format, isAfter, isBefore, addDays, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const CitaPublicaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [negocio, setNegocio] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono_cliente: '',
    servicio_id: '',
    fecha: new Date(),
    hora_inicio: '',
  });
  const [servicios, setServicios] = useState<any[]>([]);
  const [horasDisponibles, setHorasDisponibles] = useState<HorarioDisponible[]>([]);
  const [diasDisponibles, setDiasDisponibles] = useState<DiaDisponible[]>([]);
  const [success, setSuccess] = useState(false);
  const [citaId, setCitaId] = useState<string | null>(null);
  const [verificarDialogOpen, setVerificarDialogOpen] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [citasEncontradas, setCitasEncontradas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [diasSeleccionablesMes, setDiasSeleccionablesMes] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const hoy = new Date();
  const limiteMaximo = addMonths(hoy, 2);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        
        if (!slug) {
          console.error('No se encontró slug en la URL');
          toast({
            title: "Error",
            description: "URL inválida. No se pudo identificar el negocio.",
            variant: "destructive",
          });
          return;
        }

        // Cargar datos del negocio
        const negocioResult = await getNegocioBySlug(slug);
        
        if (!negocioResult.success || !negocioResult.data) {
          toast({
            title: "Error",
            description: "No se encontró el negocio solicitado.",
            variant: "destructive",
          });
          return;
        }
        
        setNegocio(negocioResult.data);
        
        // Cargar servicios del negocio
        const serviciosResult = await getServiciosByNegocioId(negocioResult.data.id);
        
        if (serviciosResult.success) {
          const serviciosActivos = serviciosResult.data.filter((s: any) => s.activo);
          setServicios(serviciosActivos);
          
          // Si no hay servicios, mostrar mensaje
          if (serviciosActivos.length === 0) {
            toast({
              title: "Información",
              description: "Este negocio aún no tiene servicios disponibles para reserva.",
            });
          }
        } else {
          console.error('Error al cargar servicios:', serviciosResult.message);
          toast({
            title: "Error",
            description: "Ocurrió un error al cargar los servicios.",
            variant: "destructive",
          });
        }
        
        // Cargar días disponibles para el mes actual
        const anioActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;
        
        await cargarDiasDisponibles(negocioResult.data.id, anioActual, mesActual);
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarDatos();
  }, [slug, toast, hoy]);
  
  const cargarDiasDisponibles = async (negocioId: string, anio: number, mes: number) => {
    try {
      const diasDispResult = await getDiasDisponibles(negocioId, anio, mes);
      
      if (diasDispResult.success && diasDispResult.data) {
        const dias = diasDispResult.data;
        setDiasDisponibles(dias);
        
        // Crear un Set con las fechas que tienen disponibilidad para facilitar la búsqueda
        const fechasDisponibles = new Set<string>();
        dias.forEach(dia => {
          if (dia.tiene_disponibilidad) {
            fechasDisponibles.add(format(new Date(dia.fecha), 'yyyy-MM-dd'));
          }
        });
        setDiasSeleccionablesMes(fechasDisponibles);
        
        // Si no hay días disponibles, mostrar mensaje
        if (fechasDisponibles.size === 0) {
          toast({
            title: "Información",
            description: "No hay horarios disponibles para este mes.",
          });
        }
      } else {
        console.error('Error al cargar días disponibles:', diasDispResult.message);
        setDiasDisponibles([]);
      }
    } catch (error) {
      console.error('Error en cargarDiasDisponibles:', error);
      setDiasDisponibles([]);
    }
  };
  
  useEffect(() => {
    const cargarHorasDisponibles = async () => {
      if (!negocio?.id || !formData.servicio_id || !formData.fecha) return;
      
      try {
        setCargandoHorarios(true);
        const servicio = servicios.find(s => s.id === formData.servicio_id);
        
        if (!servicio) return;
        
        const fechaFormateada = format(formData.fecha, 'yyyy-MM-dd');
        
        const result = await getHorariosDisponibles(
          negocio.id,
          fechaFormateada,
          servicio.duracion_minutos
        );
        
        if (result.success && result.data) {
          // Filtrar solo los horarios disponibles
          const horariosDisp = Array.isArray(result.data) 
            ? result.data.filter(h => h.disponible) 
            : [];
            
          setHorasDisponibles(horariosDisp);
          
          if (horariosDisp.length === 0) {
            toast({
              title: "Información",
              description: "No hay horarios disponibles para la fecha seleccionada.",
            });
          }
        } else {
          console.error('Error al cargar horas disponibles:', result.message);
          setHorasDisponibles([]);
        }
      } catch (error) {
        console.error('Error al cargar horas disponibles:', error);
        setHorasDisponibles([]);
      } finally {
        setCargandoHorarios(false);
      }
    };
    
    cargarHorasDisponibles();
  }, [formData.servicio_id, formData.fecha, negocio?.id, servicios, toast]);

  const handleServicioChange = (servicioId: string) => {
    setFormData(prev => ({
      ...prev,
      servicio_id: servicioId,
      hora_inicio: ''
    }));
  };

  const handleFechaChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        fecha: date,
        hora_inicio: ''
      }));
    }
  };

  const handleHoraChange = (hora: string) => {
    setFormData(prev => ({
      ...prev,
      hora_inicio: hora
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.servicio_id) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un servicio.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !formData.hora_inicio) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una hora disponible.",
        variant: "destructive",
      });
      return;
    }
    
    setStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_cliente || !formData.telefono_cliente) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const servicio = servicios.find(s => s.id === formData.servicio_id);
      if (!servicio || !negocio) return;
      
      // Calcular hora fin basada en la duración del servicio
      const [horas, minutos] = formData.hora_inicio.split(':').map(Number);
      const totalMinutos = horas * 60 + minutos + servicio.duracion_minutos;
      const horaFin = `${String(Math.floor(totalMinutos / 60)).padStart(2, '0')}:${String(totalMinutos % 60).padStart(2, '0')}`;
      
      const nuevaCita = {
        negocio_id: negocio.id,
        nombre_cliente: formData.nombre_cliente,
        telefono_cliente: formData.telefono_cliente,
        servicio_id: formData.servicio_id,
        fecha: format(formData.fecha, 'yyyy-MM-dd'),
        hora_inicio: formData.hora_inicio,
        hora_fin: horaFin,
        estado: 'pendiente'
      };
      
      const result = await createCita(nuevaCita);
      
      if (result.success) {
        setCitaId(result.data.id);
        setSuccess(true);
        
        toast({
          title: "¡Cita creada!",
          description: "Tu solicitud de cita ha sido registrada correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Ha ocurrido un error al crear la cita.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al crear cita:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la cita. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const handleVerificarCita = async () => {
    if (!telefono || !telefono.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce un número de teléfono.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await getCitaByTelefono(telefono.trim());
      
      if (result.success && result.data && result.data.length > 0) {
        setCitasEncontradas(result.data);
      } else {
        setCitasEncontradas([]);
        toast({
          title: "No se encontraron citas",
          description: "No se encontraron citas asociadas a este número de teléfono.",
        });
      }
    } catch (error) {
      console.error('Error al verificar cita:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al verificar la cita. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), 'dd/MM/yyyy');
    } catch (e) {
      return fechaStr;
    }
  };

  const esDiaDisponible = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return diasSeleccionablesMes.has(dateStr);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Negocio no encontrado</CardTitle>
            <CardDescription>
              El negocio que buscas no existe o la URL es incorrecta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Por favor, verifica la dirección o contacta con el negocio para obtener la URL correcta.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    const servicioSeleccionado = servicios.find(s => s.id === formData.servicio_id);
    
    return (
      <div className="container max-w-xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader className="text-center bg-green-50">
            <CalendarRange className="w-16 h-16 mx-auto text-green-600" />
            <CardTitle className="text-2xl text-green-700">¡Gracias por tu reserva!</CardTitle>
            <CardDescription>
              Hemos recibido tu solicitud de cita correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{negocio.nombre}</h3>
                <p className="text-gray-500">
                  <span className="font-medium">Servicio:</span> {servicioSeleccionado?.nombre}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha</p>
                  <p>{format(formData.fecha, 'EEEE, d MMMM yyyy', { locale: es })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hora</p>
                  <p>{formData.hora_inicio}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-500">Estado de la cita</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Pendiente de confirmación
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  Tu cita está <strong>pendiente de confirmación</strong> por parte del negocio.
                  Recibirás una confirmación cuando sea aceptada. También puedes verificar el estado
                  de tu cita introduciendo tu número de teléfono.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">ID de tu cita:</span> {citaId}
                </p>
              </div>
              
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={() => setVerificarDialogOpen(true)}>
                  <Clock className="mr-2 h-4 w-4" />
                  Verificar estado de cita
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-800"
            onClick={() => window.location.reload()}
          >
            Reservar otra cita
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl">{negocio.nombre}</CardTitle>
          <CardDescription>
            Reserva tu cita online en unos simples pasos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Indicador de pasos */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>

          {/* Paso 1: Seleccionar servicio */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-center">Selecciona un servicio</h2>
              
              <div className="space-y-4">
                {servicios.length === 0 ? (
                  <div className="text-center py-8">
                    <Scissors className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No hay servicios disponibles en este momento.</p>
                    <p className="text-sm text-gray-400 mt-2">Contacta directamente con el negocio para más información.</p>
                  </div>
                ) : (
                  servicios.map(servicio => (
                    <div
                      key={servicio.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.servicio_id === servicio.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => handleServicioChange(servicio.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{servicio.nombre}</h3>
                          <p className="text-sm text-gray-500">Duración: {servicio.duracion_minutos} minutos</p>
                        </div>
                        {formData.servicio_id === servicio.id && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!formData.servicio_id || servicios.length === 0}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Seleccionar fecha y hora */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-center">Selecciona fecha y hora</h2>
              
              {diasSeleccionablesMes.size === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Info className="mx-auto h-10 w-10 text-blue-500 mb-3" />
                  <p className="text-gray-700">Este negocio no tiene horarios disponibles configurados.</p>
                  <p className="text-sm text-gray-500 mt-1">Por favor, contacta directamente con el negocio.</p>
                </div>
              )}
              
              {diasSeleccionablesMes.size > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Fecha</Label>
                    <div className="border rounded-md p-3">
                      <Calendar
                        mode="single"
                        selected={formData.fecha}
                        onSelect={handleFechaChange}
                        disabled={(date) => {
                          // Deshabilitar fechas pasadas y más de 2 meses en el futuro
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          if (isBefore(date, today) || isAfter(date, limiteMaximo)) {
                            return true;
                          }
                          
                          // Verificar disponibilidad según los días disponibles
                          return !esDiaDisponible(date);
                        }}
                        locale={es}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Hora Disponible</Label>
                    {cargandoHorarios ? (
                      <div className="border rounded-md p-4 h-full flex items-center justify-center">
                        <p className="text-gray-500">Cargando horarios disponibles...</p>
                      </div>
                    ) : horasDisponibles.length === 0 ? (
                      <div className="border rounded-md p-4 bg-gray-50 h-full flex items-center justify-center">
                        <p className="text-gray-500 text-center">
                          {!formData.servicio_id 
                            ? "Por favor, selecciona un servicio primero" 
                            : "No hay horas disponibles para la fecha seleccionada"}
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-md p-4 h-72 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {horasDisponibles.map((hora, index) => (
                            <div
                              key={index}
                              className={`p-2 border rounded text-center cursor-pointer transition-colors ${
                                formData.hora_inicio === hora.hora_inicio
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'hover:border-gray-400'
                              }`}
                              onClick={() => handleHoraChange(hora.hora_inicio)}
                            >
                              {hora.hora_inicio}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Atrás
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!formData.hora_inicio || diasSeleccionablesMes.size === 0}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Datos personales */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-center">Completa tus datos</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_cliente">Nombre completo</Label>
                  <Input
                    id="nombre_cliente"
                    name="nombre_cliente"
                    value={formData.nombre_cliente}
                    onChange={handleInputChange}
                    placeholder="Introduce tu nombre"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono_cliente">Teléfono</Label>
                  <Input
                    id="telefono_cliente"
                    name="telefono_cliente"
                    value={formData.telefono_cliente}
                    onChange={handleInputChange}
                    placeholder="Ej: +34612345678"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Tu número de teléfono te permitirá verificar el estado de tu cita posteriormente.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mt-6">
                  <h3 className="font-medium mb-2">Resumen de tu cita</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-gray-600">Servicio:</p>
                    <p>{servicios.find(s => s.id === formData.servicio_id)?.nombre}</p>
                    
                    <p className="text-gray-600">Fecha:</p>
                    <p>{format(formData.fecha, 'dd/MM/yyyy')}</p>
                    
                    <p className="text-gray-600">Hora:</p>
                    <p>{formData.hora_inicio}</p>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Atrás
                  </Button>
                  <Button type="submit">
                    Confirmar Cita
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Button 
            variant="ghost" 
            onClick={() => setVerificarDialogOpen(true)}
            className="text-sm"
          >
            <Clock className="mr-2 h-4 w-4" />
            Verificar estado de cita
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog para verificar cita */}
      <Dialog open={verificarDialogOpen} onOpenChange={setVerificarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar estado de cita</DialogTitle>
            <DialogDescription>
              Introduce el número de teléfono con el que realizaste la reserva.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificar-telefono">Teléfono</Label>
              <Input
                id="verificar-telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +34612345678"
              />
            </div>
            
            {citasEncontradas.length > 0 && (
              <div className="space-y-3 mt-4">
                <h3 className="font-medium">Citas encontradas:</h3>
                
                {citasEncontradas.map((cita, index) => (
                  <div key={index} className="border rounded-md p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <p className="text-gray-600">Negocio:</p>
                      <p>{cita.negocios?.nombre || 'No especificado'}</p>
                      
                      <p className="text-gray-600">Servicio:</p>
                      <p>{cita.servicios?.nombre || 'No especificado'}</p>
                      
                      <p className="text-gray-600">Fecha:</p>
                      <p>{formatFecha(cita.fecha)}</p>
                      
                      <p className="text-gray-600">Hora:</p>
                      <p>{cita.hora_inicio} - {cita.hora_fin}</p>
                      
                      <p className="text-gray-600">Estado:</p>
                      <p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          cita.estado === 'aceptada' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {cita.estado === 'pendiente' ? 'Pendiente' : 
                           cita.estado === 'aceptada' ? 'Aceptada' : 
                           'Rechazada'}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            {citasEncontradas.length === 0 && (
              <Button onClick={handleVerificarCita}>
                Verificar
              </Button>
            )}
            <Button variant="outline" onClick={() => {
              setVerificarDialogOpen(false);
              setCitasEncontradas([]);
              setTelefono('');
            }}>
              {citasEncontradas.length > 0 ? 'Cerrar' : 'Cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitaPublicaPage;
