import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getNegocioBySlug,
  getServiciosByNegocioId,
  getHorariosDisponibles,
  getDiasDisponibles,
  createCita,
  getCitaByTelefono
} from '@/integrations/supabase/client';
import { HorarioDisponible, DiaDisponible } from '@/types';
import { format } from 'date-fns';

// Components
import ServiceSelector from './components/ServiceSelector';
import DateTimePicker from './components/DateTimePicker';
import PersonalInfoForm from './components/PersonalInfoForm';
import AppointmentSuccess from './components/AppointmentSuccess';
import VerificarCitaDialog from './components/VerificarCitaDialog';
import StepsIndicator from './components/StepsIndicator';
import NegocioNotFound from './components/NegocioNotFound';
import LoadingIndicator from './components/LoadingIndicator';

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
  const [mesActual, setMesActual] = useState<{anio: number, mes: number}>({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const cargarDatosIniciales = async () => {
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

        console.log('Obteniendo negocio por slug:', slug);
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
        
        console.log('Obteniendo servicios para negocio ID:', negocioResult.data.id);
        const serviciosResult = await getServiciosByNegocioId(negocioResult.data.id);
        
        if (serviciosResult.success) {
          const serviciosActivos = serviciosResult.data.filter((s: any) => s.activo);
          setServicios(serviciosActivos);
          
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
        
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarDatosIniciales();
  }, [slug, toast]);
  
  useEffect(() => {
    if (negocio?.id) {
      setDiasSeleccionablesMes(new Set());
      cargarDiasDisponibles(mesActual.anio, mesActual.mes);
    }
  }, [negocio?.id, mesActual, cargarDiasDisponibles]);
  
  const cargarDiasDisponibles = useCallback(async (anio: number, mes: number) => {
    if (!negocio?.id) return;
    
    try {
      console.log(`Obteniendo días disponibles para negocio ID: ${negocio.id} en año: ${anio}, mes: ${mes}`);
      setIsLoading(true);
      
      const diasDispResult = await getDiasDisponibles(negocio.id, anio, mes);
      
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
        
        console.log(`Fechas disponibles encontradas: ${fechasDisponibles.size}`, 
          Array.from(fechasDisponibles).join(', '));
          
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
        setDiasSeleccionablesMes(new Set());
      }
    } catch (error) {
      console.error('Error en cargarDiasDisponibles:', error);
      setDiasDisponibles([]);
      setDiasSeleccionablesMes(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [negocio?.id, toast]);
  
  useEffect(() => {
    const cargarHorasDisponibles = async () => {
      if (!negocio?.id || !formData.servicio_id || !formData.fecha) return;
      
      try {
        setCargandoHorarios(true);
        const servicio = servicios.find(s => s.id === formData.servicio_id);
        
        if (!servicio) return;
        
        const fechaFormateada = format(formData.fecha, 'yyyy-MM-dd');
        
        console.log(`Obteniendo horarios para negocio: ${negocio.id}, fecha: ${fechaFormateada}, duración: ${servicio.duracion_minutos}`);
        const result = await getHorariosDisponibles(
          negocio.id,
          fechaFormateada,
          servicio.duracion_minutos
        );
        
        if (result.success && result.data) {
          // Mostrar todos los horarios para depuración
          console.log('Horarios recibidos:', result.data);
          
          // Filtrar solo los horarios disponibles
          const horariosDisp = Array.isArray(result.data) 
            ? result.data
            : [];
            
          setHorasDisponibles(horariosDisp);
          
          const horariosDisponibles = horariosDisp.filter(h => h.disponible);
          
          console.log(`Se encontraron ${horariosDisponibles.length} horarios disponibles de ${horariosDisp.length} totales`);
          
          if (horariosDisponibles.length === 0) {
            setFormData(prev => ({
              ...prev,
              hora_inicio: ''
            }));
            
            toast({
              title: "Información",
              description: "No hay horarios disponibles para la fecha seleccionada.",
            });
          }
        } else {
          console.error('Error al cargar horas disponibles:', result.message);
          setHorasDisponibles([]);
          setFormData(prev => ({
            ...prev,
            hora_inicio: ''
          }));
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

  const handleMonthChange = (date: Date) => {
    const nuevoAnio = date.getFullYear();
    const nuevoMes = date.getMonth() + 1;
    
    // Solo actualizar si cambia el mes
    if (nuevoAnio !== mesActual.anio || nuevoMes !== mesActual.mes) {
      setMesActual({
        anio: nuevoAnio,
        mes: nuevoMes
      });
    }
  };

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

  const handleDialogClose = () => {
    setVerificarDialogOpen(false);
    setCitasEncontradas([]);
    setTelefono('');
  };

  if (isLoading && !negocio) {
    return <LoadingIndicator message="Cargando información del negocio..." />;
  }

  if (!negocio) {
    return <NegocioNotFound />;
  }

  if (success) {
    return (
      <AppointmentSuccess 
        negocio={negocio}
        formData={formData}
        servicios={servicios}
        citaId={citaId}
        onVerificarClick={() => setVerificarDialogOpen(true)}
      />
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
          <StepsIndicator currentStep={step} />

          {step === 1 && (
            <ServiceSelector 
              servicios={servicios}
              selectedServiceId={formData.servicio_id}
              onServiceChange={handleServicioChange}
              onNext={handleNext}
            />
          )}

          {step === 2 && (
            <DateTimePicker 
              date={formData.fecha}
              selectedTime={formData.hora_inicio}
              diasSeleccionablesMes={diasSeleccionablesMes}
              horasDisponibles={horasDisponibles}
              cargandoHorarios={cargandoHorarios}
              onDateChange={handleFechaChange}
              onTimeChange={handleHoraChange}
              onMonthChange={handleMonthChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 3 && (
            <PersonalInfoForm 
              formData={formData}
              servicios={servicios}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
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

      <VerificarCitaDialog
        open={verificarDialogOpen}
        onOpenChange={handleDialogClose}
        telefono={telefono}
        onTelefonoChange={(value) => setTelefono(value)}
        citasEncontradas={citasEncontradas}
        onVerificar={handleVerificarCita}
      />
    </div>
  );
};

export default CitaPublicaPage;
