
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createHorario, getHorariosByNegocioId, deleteHorario, updateHorario } from '@/integrations/supabase/schedules';
import { Loader2, Trash2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface HorarioRecurrente {
  id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

interface HorariosRecurrentesFormProps {
  negocioId: string;
}

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miércoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sábado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const HorariosRecurrentesForm = ({ negocioId }: HorariosRecurrentesFormProps) => {
  const [horarios, setHorarios] = useState<HorarioRecurrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoHorario, setNuevoHorario] = useState<Omit<HorarioRecurrente, 'id'>>({
    dia_semana: 'lunes',
    hora_inicio: '09:00',
    hora_fin: '18:00'
  });
  const { toast } = useToast();

  useEffect(() => {
    const cargarHorarios = async () => {
      if (!negocioId) return;
      
      setLoading(true);
      try {
        const result = await getHorariosByNegocioId(negocioId);
        if (result.success) {
          setHorarios(result.data);
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los horarios",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error al cargar horarios:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los horarios",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    cargarHorarios();
  }, [negocioId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoHorario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiaChange = (value: string) => {
    setNuevoHorario(prev => ({
      ...prev,
      dia_semana: value
    }));
  };

  const validarHorario = () => {
    if (nuevoHorario.hora_inicio >= nuevoHorario.hora_fin) {
      toast({
        title: "Error",
        description: "La hora de inicio debe ser anterior a la hora de fin",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleGuardarHorario = async () => {
    if (!validarHorario()) return;

    try {
      const horarioData = {
        negocio_id: negocioId,
        dia_semana: nuevoHorario.dia_semana,
        hora_inicio: nuevoHorario.hora_inicio,
        hora_fin: nuevoHorario.hora_fin
      };
      
      const result = await createHorario(horarioData);
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: "Horario guardado correctamente"
        });
        
        setHorarios([...horarios, result.data]);
        
        setNuevoHorario({
          dia_semana: 'lunes',
          hora_inicio: '09:00',
          hora_fin: '18:00'
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo guardar el horario",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al guardar horario:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el horario",
        variant: "destructive"
      });
    }
  };

  const handleEliminarHorario = async (id: string) => {
    try {
      const result = await deleteHorario(id);
      
      if (result.success) {
        setHorarios(horarios.filter(h => h.id !== id));
        toast({
          title: "Éxito",
          description: "Horario eliminado correctamente"
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo eliminar el horario",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el horario",
        variant: "destructive"
      });
    }
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
        <CardTitle>Horarios Recurrentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Días de la semana</label>
              <ToggleGroup type="single" value={nuevoHorario.dia_semana} onValueChange={handleDiaChange} className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <ToggleGroupItem key={dia.value} value={dia.value} className="px-3 py-2">
                    {dia.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Hora inicio</label>
                <Input 
                  type="time" 
                  name="hora_inicio" 
                  value={nuevoHorario.hora_inicio}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Hora fin</label>
                <Input 
                  type="time" 
                  name="hora_fin" 
                  value={nuevoHorario.hora_fin}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleGuardarHorario} className="w-full">
                  Agregar Horario
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Horarios configurados</h3>
            
            {horarios.length === 0 ? (
              <p className="text-gray-500 italic">No hay horarios configurados</p>
            ) : (
              <div className="space-y-2">
                {horarios.map((horario) => (
                  <div key={horario.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium capitalize">{horario.dia_semana}</span>: {horario.hora_inicio.substring(0, 5)} - {horario.hora_fin.substring(0, 5)}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleEliminarHorario(horario.id)}
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

export default HorariosRecurrentesForm;
