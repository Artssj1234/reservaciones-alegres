
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { crearCitaSegura, buscarCitasPorTelefono } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface CitaFormData {
  nombre_cliente: string;
  telefono_cliente: string;
  servicio_id: string;
  fecha: Date;
  hora_inicio: string;
}

export const useCitaForm = (negocioId: string | undefined) => {
  const [formData, setFormData] = useState<CitaFormData>({
    nombre_cliente: '',
    telefono_cliente: '',
    servicio_id: '',
    fecha: new Date(),
    hora_inicio: '',
  });
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [citaId, setCitaId] = useState<string | null>(null);
  const [verificarDialogOpen, setVerificarDialogOpen] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [citasEncontradas, setCitasEncontradas] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSubmit = async (e: React.FormEvent, servicios: any[]) => {
    e.preventDefault();
    
    if (!formData.nombre_cliente || !formData.telefono_cliente) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      return;
    }
    
    if (isSubmitting) {
      return; // Prevenir doble envío
    }
    
    try {
      setIsSubmitting(true);
      
      const servicio = servicios.find(s => s.id === formData.servicio_id);
      if (!servicio || !negocioId) {
        toast({
          title: "Error",
          description: "Servicio o negocio no encontrado.",
          variant: "destructive",
        });
        return;
      }
      
      // Calcular hora fin basada en la duración del servicio
      const [horas, minutos] = formData.hora_inicio.split(':').map(Number);
      const totalMinutos = horas * 60 + minutos + servicio.duracion_minutos;
      const horaFin = `${String(Math.floor(totalMinutos / 60)).padStart(2, '0')}:${String(totalMinutos % 60).padStart(2, '0')}`;
      
      // Formato de fecha para base de datos
      const fechaFormateada = format(formData.fecha, 'yyyy-MM-dd');
      
      // Usar la nueva función segura para crear citas
      const citaData = {
        negocio_id: negocioId,
        nombre_cliente: formData.nombre_cliente,
        telefono_cliente: formData.telefono_cliente,
        servicio_id: formData.servicio_id,
        fecha: fechaFormateada,
        hora_inicio: formData.hora_inicio,
        hora_fin: horaFin
      };
      
      const result = await crearCitaSegura(citaData);
      
      if (result.success) {
        if (result.citaId) {
          setCitaId(result.citaId);
        }
        setSuccess(true);
        
        toast({
          title: "¡Cita creada!",
          description: result.message || "Tu solicitud de cita ha sido registrada correctamente.",
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
    } finally {
      setIsSubmitting(false);
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
      const result = await buscarCitasPorTelefono(telefono.trim());
      
      if (result.success && result.citas && result.citas.length > 0) {
        setCitasEncontradas(result.citas);
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

  return {
    formData,
    step,
    success,
    citaId,
    verificarDialogOpen,
    telefono,
    citasEncontradas,
    isSubmitting,
    setVerificarDialogOpen,
    setTelefono,
    handleInputChange,
    handleServicioChange,
    handleFechaChange,
    handleHoraChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleVerificarCita,
    handleDialogClose
  };
};
