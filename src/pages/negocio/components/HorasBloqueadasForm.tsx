
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createHoraBloqueada, getHorasBloqueadasByNegocioId, deleteHoraBloqueada } from '@/integrations/supabase/client';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HoraBloqueada {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo?: string;
}

interface HorasBloqueadasFormProps {
  negocioId: string;
}

const HorasBloqueadasForm = ({ negocioId }: HorasBloqueadasFormProps) => {
  const [horasBloqueadas, setHorasBloqueadas] = useState<HoraBloqueada[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaHora, setNuevaHora] = useState<Omit<HoraBloqueada, 'id'>>({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '09:00',
    hora_fin: '10:00',
    motivo: ''
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const cargarHorasBloqueadas = async () => {
      if (!negocioId) return;
      
      setLoading(true);
      try {
        const result = await getHorasBloqueadasByNegocioId(negocioId);
        if (result.success) {
          setHorasBloqueadas(result.data);
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar las horas bloqueadas",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error al cargar horas bloqueadas:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar las horas bloqueadas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    cargarHorasBloqueadas();
  }, [negocioId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNuevaHora(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFechaSeleccionada(date);
      setNuevaHora(prev => ({
        ...prev,
        fecha: format(date, 'yyyy-MM-dd')
      }));
      setCalendarOpen(false);
    }
  };

  const validarHoraBloqueada = () => {
    if (nuevaHora.hora_inicio >= nuevaHora.hora_fin) {
      toast({
        title: "Error",
        description: "La hora de inicio debe ser anterior a la hora de fin",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleGuardarHoraBloqueada = async () => {
    if (!validarHoraBloqueada()) return;

    try {
      const horaBloqueadaData = {
        negocio_id: negocioId,
        fecha: nuevaHora.fecha,
        hora_inicio: nuevaHora.hora_inicio,
        hora_fin: nuevaHora.hora_fin,
        motivo: nuevaHora.motivo
      };
      
      const result = await createHoraBloqueada(horaBloqueadaData);
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Hora bloqueada guardada correctamente"
        });
        
        setHorasBloqueadas([...horasBloqueadas, result.data]);
        
        setNuevaHora({
          fecha: nuevaHora.fecha,
          hora_inicio: '09:00',
          hora_fin: '10:00',
          motivo: ''
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo guardar la hora bloqueada",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al guardar hora bloqueada:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la hora bloqueada",
        variant: "destructive"
      });
    }
  };

  const handleEliminarHoraBloqueada = async (id: string) => {
    try {
      const result = await deleteHoraBloqueada(id);
      
      if (result.success) {
        setHorasBloqueadas(horasBloqueadas.filter(h => h.id !== id));
        toast({
          title: "Éxito",
          description: "Hora bloqueada eliminada correctamente"
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo eliminar la hora bloqueada",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al eliminar hora bloqueada:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la hora bloqueada",
        variant: "destructive"
      });
    }
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return format(fecha, 'dd/MM/yyyy', { locale: es });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Bloquear Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(fechaSeleccionada, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaSeleccionada}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium">Hora inicio</label>
              <Input 
                type="time" 
                name="hora_inicio" 
                value={nuevaHora.hora_inicio}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Hora fin</label>
              <Input 
                type="time" 
                name="hora_fin" 
                value={nuevaHora.hora_fin}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Motivo (opcional)</label>
              <Input 
                type="text" 
                name="motivo" 
                value={nuevaHora.motivo}
                onChange={handleInputChange}
                placeholder="Ej: Reunión, Descanso..."
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleGuardarHoraBloqueada} className="w-full">
                Bloquear Hora
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Horas bloqueadas</h3>
            
            {horasBloqueadas.length === 0 ? (
              <p className="text-gray-500 italic">No hay horas bloqueadas</p>
            ) : (
              <div className="space-y-2">
                {horasBloqueadas.map((hora) => (
                  <div key={hora.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{formatFecha(hora.fecha)}</span>: {hora.hora_inicio.substring(0, 5)} - {hora.hora_fin.substring(0, 5)}
                      {hora.motivo && <span className="ml-2 text-gray-500">({hora.motivo})</span>}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleEliminarHoraBloqueada(hora.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HorasBloqueadasForm;
