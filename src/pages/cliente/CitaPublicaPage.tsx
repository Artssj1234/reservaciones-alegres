
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
import { CalendarRange, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

// Mock data
const mockNegocio = {
  id: '1',
  nombre: 'Peluquería Ejemplo',
  slug: 'peluqueria-ejemplo',
};

const mockServicios = [
  { id: '1', nombre: 'Corte de pelo', duracion_minutos: 30 },
  { id: '2', nombre: 'Tinte', duracion_minutos: 60 },
  { id: '3', nombre: 'Peinado', duracion_minutos: 45 },
  { id: '4', nombre: 'Corte y afeitado', duracion_minutos: 45 },
  { id: '5', nombre: 'Corte y peinado', duracion_minutos: 60 }
];

const mockHorariosRecurrentes = [
  { id: '1', dia_semana: 'lunes', hora_inicio: '09:00', hora_fin: '14:00' },
  { id: '2', dia_semana: 'lunes', hora_inicio: '16:00', hora_fin: '20:00' },
  { id: '3', dia_semana: 'martes', hora_inicio: '09:00', hora_fin: '14:00' },
  { id: '4', dia_semana: 'martes', hora_inicio: '16:00', hora_fin: '20:00' },
  { id: '5', dia_semana: 'miércoles', hora_inicio: '09:00', hora_fin: '14:00' },
  { id: '6', dia_semana: 'miércoles', hora_inicio: '16:00', hora_fin: '20:00' },
  { id: '7', dia_semana: 'jueves', hora_inicio: '09:00', hora_fin: '14:00' },
  { id: '8', dia_semana: 'jueves', hora_inicio: '16:00', hora_fin: '20:00' },
  { id: '9', dia_semana: 'viernes', hora_inicio: '09:00', hora_fin: '14:00' },
  { id: '10', dia_semana: 'viernes', hora_inicio: '16:00', hora_fin: '20:00' },
  { id: '11', dia_semana: 'sábado', hora_inicio: '10:00', hora_fin: '14:00' }
];

const mockHorasBloqueadas = [
  { id: '1', fecha: '2023-06-15', hora_inicio: '11:00', hora_fin: '12:00' },
  { id: '2', fecha: '2023-06-16', hora_inicio: '16:00', hora_fin: '17:30' }
];

const mockCitas = [
  { 
    id: '1', 
    fecha: '2023-06-15', 
    hora_inicio: '10:00', 
    hora_fin: '10:45',
    estado: 'pendiente'
  },
  { 
    id: '2', 
    fecha: '2023-06-15', 
    hora_inicio: '12:30', 
    hora_fin: '13:30',
    estado: 'aceptada'
  },
];

// Funciones auxiliares
const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const obtenerDiaSemana = (fecha: Date) => {
  return diasSemana[fecha.getDay()];
};

const formatearFecha = (fecha: Date) => {
  return fecha.toISOString().split('T')[0];
};

const genererHorasDisponibles = (fecha: Date, servicioId: string) => {
  const diaSemana = obtenerDiaSemana(fecha);
  const fechaFormateada = formatearFecha(fecha);
  const servicio = mockServicios.find(s => s.id === servicioId);
  
  if (!servicio) return [];
  
  // Obtener horarios del día de la semana
  const horariosDelDia = mockHorariosRecurrentes.filter(h => h.dia_semana === diaSemana);
  
  if (horariosDelDia.length === 0) return [];
  
  // Obtener horas bloqueadas para la fecha
  const horasBloqueadas = mockHorasBloqueadas.filter(h => h.fecha === fechaFormateada);
  
  // Obtener citas existentes para la fecha
  const citasFecha = mockCitas.filter(c => c.fecha === fechaFormateada);
  
  // Generar slots de 15 minutos dentro de los horarios del día
  const slots = [];
  
  for (const horario of horariosDelDia) {
    let [horaInicio, minutoInicio] = horario.hora_inicio.split(':').map(Number);
    const [horaFin, minutoFin] = horario.hora_fin.split(':').map(Number);
    
    while (
      horaInicio < horaFin || 
      (horaInicio === horaFin && minutoInicio < minutoFin)
    ) {
      const horaFormateada = `${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`;
      
      // Calcular hora fin del servicio
      const minutosTotales = horaInicio * 60 + minutoInicio + servicio.duracion_minutos;
      const horaFinServicio = Math.floor(minutosTotales / 60);
      const minutoFinServicio = minutosTotales % 60;
      const horaFinFormateada = `${String(horaFinServicio).padStart(2, '0')}:${String(minutoFinServicio).padStart(2, '0')}`;
      
      // Comprobar si el slot completo está dentro del horario
      const slotDentroDeHorario = 
        horaFinServicio < horaFin || 
        (horaFinServicio === horaFin && minutoFinServicio <= minutoFin);
      
      // Comprobar si el slot se solapa con horas bloqueadas
      const seSolapaConBloqueadas = horasBloqueadas.some(bloqueo => {
        const [hbInicio, mbInicio] = bloqueo.hora_inicio.split(':').map(Number);
        const [hbFin, mbFin] = bloqueo.hora_fin.split(':').map(Number);
        
        const bloqueInicio = hbInicio * 60 + mbInicio;
        const bloqueFin = hbFin * 60 + mbFin;
        const slotInicio = horaInicio * 60 + minutoInicio;
        const slotFin = horaFinServicio * 60 + minutoFinServicio;
        
        return (
          (slotInicio < bloqueFin && slotInicio >= bloqueInicio) ||
          (slotFin > bloqueInicio && slotFin <= bloqueFin) ||
          (slotInicio <= bloqueInicio && slotFin >= bloqueFin)
        );
      });
      
      // Comprobar si el slot se solapa con citas existentes
      const seSolapaConCitas = citasFecha.some(cita => {
        const [hcInicio, mcInicio] = cita.hora_inicio.split(':').map(Number);
        const [hcFin, mcFin] = cita.hora_fin.split(':').map(Number);
        
        const citaInicio = hcInicio * 60 + mcInicio;
        const citaFin = hcFin * 60 + mcFin;
        const slotInicio = horaInicio * 60 + minutoInicio;
        const slotFin = horaFinServicio * 60 + minutoFinServicio;
        
        return (
          (slotInicio < citaFin && slotInicio >= citaInicio) ||
          (slotFin > citaInicio && slotFin <= citaFin) ||
          (slotInicio <= citaInicio && slotFin >= citaFin)
        );
      });
      
      // Si el slot es válido, añadirlo a la lista
      if (slotDentroDeHorario && !seSolapaConBloqueadas && !seSolapaConCitas) {
        slots.push({
          hora_inicio: horaFormateada,
          hora_fin: horaFinFormateada
        });
      }
      
      // Avanzar 15 minutos
      minutoInicio += 15;
      if (minutoInicio >= 60) {
        horaInicio += Math.floor(minutoInicio / 60);
        minutoInicio %= 60;
      }
    }
  }
  
  return slots;
};

// Componente principal
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
  const [horasDisponibles, setHorasDisponibles] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [citaId, setCitaId] = useState<string | null>(null);
  const [verificarDialogOpen, setVerificarDialogOpen] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [cita, setCita] = useState<any | null>(null);
  const { toast } = useToast();
  
  // En una aplicación real, esto obtendría los datos de Supabase
  useEffect(() => {
    // Simular carga de datos
    setNegocio(mockNegocio);
    setServicios(mockServicios);
  }, [slug]);
  
  useEffect(() => {
    if (formData.servicio_id && formData.fecha) {
      const horas = genererHorasDisponibles(formData.fecha, formData.servicio_id);
      setHorasDisponibles(horas);
    }
  }, [formData.servicio_id, formData.fecha]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_cliente || !formData.telefono_cliente) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      return;
    }
    
    // En una aplicación real, esto enviaría los datos a Supabase
    
    // Simular creación de cita
    const servicio = servicios.find(s => s.id === formData.servicio_id);
    if (!servicio) return;
    
    const minutosTotales = formData.hora_inicio.split(':').map(Number).reduce((acc, val, i) => acc + (i === 0 ? val * 60 : val), 0) + servicio.duracion_minutos;
    
    const horaFin = `${String(Math.floor(minutosTotales / 60)).padStart(2, '0')}:${String(minutosTotales % 60).padStart(2, '0')}`;
    
    const nuevaCita = {
      id: Math.random().toString(36).substring(2, 11),
      negocio_id: negocio.id,
      nombre_cliente: formData.nombre_cliente,
      telefono_cliente: formData.telefono_cliente,
      servicio_id: formData.servicio_id,
      servicio: servicio.nombre,
      fecha: formatearFecha(formData.fecha),
      hora_inicio: formData.hora_inicio,
      hora_fin: horaFin,
      estado: 'pendiente',
      creada_en: new Date().toISOString()
    };
    
    setCitaId(nuevaCita.id);
    setCita(nuevaCita);
    setSuccess(true);
  };

  const handleVerificarCita = () => {
    // En una aplicación real, esto verificaría la cita en Supabase
    if (telefono && telefono.trim()) {
      // Simulamos encontrar una cita
      const citaEncontrada = {
        id: '123456',
        negocio: 'Peluquería Ejemplo',
        servicio: 'Corte de pelo',
        fecha: '2023-06-20',
        hora_inicio: '10:00',
        hora_fin: '10:30',
        estado: 'pendiente',
      };
      
      setCita(citaEncontrada);
    } else {
      toast({
        title: "Error",
        description: "Por favor, introduce un número de teléfono.",
        variant: "destructive",
      });
    }
  };

  if (!negocio) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (success) {
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
                  <span className="font-medium">Servicio:</span> {servicios.find(s => s.id === formData.servicio_id)?.nombre}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha</p>
                  <p>{formData.fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-reserva-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-reserva-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-reserva-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-reserva-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-reserva-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>

          {/* Paso 1: Seleccionar servicio */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-center">Selecciona un servicio</h2>
              
              <div className="space-y-4">
                {servicios.map(servicio => (
                  <div
                    key={servicio.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.servicio_id === servicio.id
                        ? 'border-reserva-primary bg-blue-50'
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
                        <CheckCircle2 className="h-5 w-5 text-reserva-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNext}>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Fecha</Label>
                  <div className="border rounded-md p-3">
                    <Calendar
                      mode="single"
                      selected={formData.fecha}
                      onSelect={handleFechaChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Deshabilitar fechas pasadas y más de 2 meses en el futuro
                        const twoMonthsFromNow = new Date();
                        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
                        
                        return date < today || date > twoMonthsFromNow || 
                          // Deshabilitar domingos
                          date.getDay() === 0;
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Hora Disponible</Label>
                  {horasDisponibles.length === 0 ? (
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
                                ? 'border-reserva-primary bg-blue-50'
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
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Atrás
                </Button>
                <Button onClick={handleNext} disabled={!formData.hora_inicio}>
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
                    <p>{formData.fecha.toLocaleDateString('es-ES')}</p>
                    
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
            
            {cita && (
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Detalles de tu cita</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-600">Servicio:</p>
                  <p>{cita.servicio}</p>
                  
                  <p className="text-gray-600">Fecha:</p>
                  <p>{new Date(cita.fecha).toLocaleDateString('es-ES')}</p>
                  
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
            )}
          </div>
          
          <DialogFooter>
            {!cita && (
              <Button onClick={handleVerificarCita}>
                Verificar
              </Button>
            )}
            <Button variant="outline" onClick={() => {
              setVerificarDialogOpen(false);
              setCita(null);
              setTelefono('');
            }}>
              {cita ? 'Cerrar' : 'Cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitaPublicaPage;
