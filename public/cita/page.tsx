
import { useState, useEffect } from 'react';
import { format, startOfMonth, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDiasDisponibles, getHorariosDisponibles } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function ReservaFlujoCliente({ negocioId }: { negocioId: string }) {
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [diasDisponibles, setDiasDisponibles] = useState<Set<string>>(new Set());
  const [horas, setHoras] = useState<any[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [cliente, setCliente] = useState({ nombre: '', telefono: '' });
  const [cargando, setCargando] = useState(false);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setCargando(true);
        const res = await fetch(`/api/negocios/${negocioId}/servicios`);
        if (!res.ok) {
          throw new Error('Error al cargar los servicios');
        }
        const data = await res.json();
        setServicios(data);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los servicios',
          variant: 'destructive',
        });
      } finally {
        setCargando(false);
      }
    };

    if (negocioId) {
      fetchServicios();
    }
  }, [negocioId, toast]);

  const cargarDiasDisponibles = async (date: Date) => {
    if (!servicioSeleccionado) return;
    
    try {
      const anio = date.getFullYear();
      const mes = date.getMonth() + 1;
      
      setCargando(true);
      const res = await getDiasDisponibles(negocioId, anio, mes, servicioSeleccionado.id);
      
      if (res.success) {
        const nuevosDisponibles = new Set<string>();
        res.data.forEach(dia => {
          if (dia.tiene_disponibilidad) {
            nuevosDisponibles.add(dia.fecha);
          }
        });
        setDiasDisponibles(nuevosDisponibles);
        
        if (nuevosDisponibles.size === 0) {
          toast({
            title: 'Información',
            description: 'No hay días disponibles en este mes',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la disponibilidad',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al cargar días disponibles:', error);
      toast({
        title: 'Error',
        description: 'Error al verificar disponibilidad',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCalendarMonthChange = (date: Date) => {
    cargarDiasDisponibles(date);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setFechaSeleccionada(date);
    cargarHorariosPorFecha(date);
  };

  const cargarHorariosPorFecha = async (fecha: Date) => {
    if (!servicioSeleccionado) return;
    
    try {
      setCargandoHoras(true);
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      const res = await getHorariosDisponibles(negocioId, fechaStr, servicioSeleccionado.id);
      
      if (res.success) {
        setHoras(res.data);
        setHoraSeleccionada('');
        
        if (res.data.filter(h => h.disponible).length === 0) {
          toast({
            title: 'Información',
            description: 'No hay horarios disponibles para esta fecha',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los horarios',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los horarios disponibles',
        variant: 'destructive',
      });
    } finally {
      setCargandoHoras(false);
    }
  };

  useEffect(() => {
    if (step === 2 && servicioSeleccionado) {
      cargarDiasDisponibles(fechaSeleccionada);
    }
  }, [step, servicioSeleccionado]);

  const crearCita = async () => {
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negocio_id: negocioId,
          servicio_id: servicioSeleccionado.id,
          fecha: format(fechaSeleccionada, 'yyyy-MM-dd'),
          hora: horaSeleccionada,
          cliente,
        }),
      });

      if (res.ok) {
        const { telefono } = await res.json();
        window.location.href = `/citas/${telefono}`;
      } else {
        toast({ title: 'Error', description: 'No se pudo crear la cita', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error al crear la cita:', error);
      toast({ title: 'Error', description: 'Error al procesar la solicitud', variant: 'destructive' });
    }
  };

  const esFechaDisponible = (date: Date) => {
    const fechaFormateada = format(date, 'yyyy-MM-dd');
    return diasDisponibles.has(fechaFormateada);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {cargando && step !== 3 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-bold">Selecciona un servicio</h2>
            {servicios.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay servicios disponibles para este negocio
              </p>
            ) : (
              <div className="grid gap-2">
                {servicios.map(s => (
                  <Button
                    key={s.id}
                    variant={servicioSeleccionado?.id === s.id ? "default" : "outline"} 
                    className="justify-start w-full"
                    onClick={() => {
                      setServicioSeleccionado(s);
                      setStep(2);
                    }}
                  >
                    <div className="flex justify-between w-full">
                      <span>{s.nombre}</span>
                      <span className="text-sm">{s.duracion_minutos} min</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && servicioSeleccionado && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-bold">Selecciona fecha y hora</h2>
            
            <div className="border rounded-md p-3">
              <Calendar
                mode="single"
                selected={fechaSeleccionada}
                onSelect={handleDateSelect}
                onMonthChange={handleCalendarMonthChange}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || !esFechaDisponible(date);
                }}
                locale={es}
                initialFocus
                className="pointer-events-auto"
              />
            </div>

            {cargandoHoras ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              fechaSeleccionada && (
                <div className="space-y-2">
                  <h3 className="font-medium">Horarios para {format(fechaSeleccionada, 'dd/MM/yyyy')}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {horas.filter(h => h.disponible).length > 0 ? (
                      horas.filter(h => h.disponible).map(h => (
                        <Button
                          key={h.hora_inicio}
                          onClick={() => setHoraSeleccionada(h.hora_inicio)}
                          variant={horaSeleccionada === h.hora_inicio ? "default" : "outline"}
                          size="sm"
                        >
                          {h.hora_inicio.slice(0, 5)}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground col-span-3">
                        No hay horarios disponibles para esta fecha
                      </p>
                    )}
                  </div>
                </div>
              )
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Atrás</Button>
              <Button onClick={() => setStep(3)} disabled={!horaSeleccionada}>
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-bold">Confirma tus datos</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Servicio:</p>
                <p className="text-sm">{servicioSeleccionado?.nombre}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Fecha y hora:</p>
                <p className="text-sm">
                  {format(fechaSeleccionada, 'dd/MM/yyyy')} a las {horaSeleccionada.slice(0, 5)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Input 
                placeholder="Tu nombre" 
                value={cliente.nombre} 
                onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                className="mt-4"
              />
              <Input 
                placeholder="Tu teléfono" 
                value={cliente.telefono} 
                onChange={e => setCliente({ ...cliente, telefono: e.target.value })} 
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Atrás</Button>
              <Button 
                onClick={crearCita} 
                disabled={!cliente.nombre || !cliente.telefono}
              >
                Confirmar cita
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
