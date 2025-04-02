
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getDiasDisponibles, getHorariosDisponibles } from '@/integrations/supabase/client';
import { HorarioDisponible, DiaDisponible } from '@/types';
import { format, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

export const useDisponibilidad = (negocioId: string | undefined, servicioId: string, fecha: Date) => {
  const [horasDisponibles, setHorasDisponibles] = useState<HorarioDisponible[]>([]);
  const [diasDisponibles, setDiasDisponibles] = useState<DiaDisponible[]>([]);
  const [diasSeleccionablesMes, setDiasSeleccionablesMes] = useState<Set<string>>(new Set());
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mesActual, setMesActual] = useState<{anio: number, mes: number}>({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1
  });
  const { toast } = useToast();

  const cargarDiasDisponibles = useCallback(async (anio: number, mes: number) => {
    if (!negocioId) return;
    
    try {
      console.log(`Obteniendo días disponibles para negocio ID: ${negocioId} en año: ${anio}, mes: ${mes}`);
      setIsLoading(true);
      
      const diasDispResult = await getDiasDisponibles(negocioId, anio, mes);
      
      if (diasDispResult.success && diasDispResult.data) {
        const dias = diasDispResult.data;
        setDiasDisponibles(dias);
        
        // Crear un Set con las fechas que tienen disponibilidad para facilitar la búsqueda
        // Importante: Ahora consideramos TODOS los días que tienen horario configurado como disponibles
        // incluso si no tienen el campo tiene_disponibilidad como true
        const fechasDisponibles = new Set<string>();
        dias.forEach(dia => {
          // Si el día tiene un horario configurado (sin importar si está completamente ocupado)
          // lo marcamos como disponible para permitir la selección
          if (dia.estado !== 'sin_horario') {
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
            description: "No hay horarios configurados para este mes. Por favor, configura tus horarios regulares.",
            duration: 5000,
          });
        }
      } else {
        console.error('Error al cargar días disponibles:', diasDispResult.message);
        toast({
          title: "Error",
          description: "No se pudo cargar la disponibilidad. Intenta más tarde.",
          variant: "destructive"
        });
        setDiasDisponibles([]);
        setDiasSeleccionablesMes(new Set());
      }
    } catch (error) {
      console.error('Error en cargarDiasDisponibles:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar la disponibilidad.",
        variant: "destructive"
      });
      setDiasDisponibles([]);
      setDiasSeleccionablesMes(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [negocioId, toast]);

  const handleMonthChange = useCallback((date: Date) => {
    const nuevoAnio = date.getFullYear();
    const nuevoMes = date.getMonth() + 1;
    
    console.log(`Month changed to: ${nuevoMes}/${nuevoAnio}`);
    
    // Solo actualizar si cambia el mes
    if (nuevoAnio !== mesActual.anio || nuevoMes !== mesActual.mes) {
      setMesActual({
        anio: nuevoAnio,
        mes: nuevoMes
      });
    }
  }, [mesActual]);

  // Load available days when month or business changes
  useEffect(() => {
    if (negocioId) {
      console.log(`Loading availability for business ID ${negocioId} for month ${mesActual.mes}/${mesActual.anio}`);
      setDiasSeleccionablesMes(new Set());
      cargarDiasDisponibles(mesActual.anio, mesActual.mes);
    }
  }, [negocioId, mesActual, cargarDiasDisponibles]);

  // Load available time slots when date or service changes
  useEffect(() => {
    const cargarHorasDisponibles = async () => {
      if (!negocioId || !servicioId) {
        console.log("Missing required data: negocioId or servicioId");
        setHorasDisponibles([]);
        return;
      }
      
      try {
        console.log(`Loading time slots for date: ${format(fecha, 'yyyy-MM-dd')}`);
        setCargandoHorarios(true);
        
        const fechaFormateada = format(fecha, 'yyyy-MM-dd');
        
        // Get the duration from the selected service
        let duracionMinutos = 30; // Default duration
        
        if (servicioId) {
          // Here we would ideally get the duration from the service
          // But for now we'll assume it's passed to the function
          duracionMinutos = servicioId ? 30 : 30; 
        }
        
        console.log(`Obteniendo horarios para negocio: ${negocioId}, fecha: ${fechaFormateada}, duración: ${duracionMinutos}`);
        const result = await getHorariosDisponibles(
          negocioId,
          fechaFormateada,
          duracionMinutos
        );
        
        if (result.success && result.data) {
          console.log('Horarios recibidos:', result.data);
          
          // Ensure we have an array of time slots
          const horariosDisp = Array.isArray(result.data) ? result.data : [];
            
          // Store all time slots including unavailable ones
          setHorasDisponibles(horariosDisp);
          
          const horariosDisponibles = horariosDisp.filter(h => h.disponible);
          
          console.log(`Se encontraron ${horariosDisponibles.length} horarios disponibles de ${horariosDisp.length} totales`);
          
          if (horariosDisponibles.length === 0 && horariosDisp.length > 0) {
            toast({
              title: "Información",
              description: "No hay horarios disponibles para la fecha seleccionada.",
            });
          }
        } else {
          console.error('Error al cargar horas disponibles:', result.message);
          toast({
            title: "Error",
            description: "No se pudo cargar los horarios disponibles.",
            variant: "destructive"
          });
          setHorasDisponibles([]);
        }
      } catch (error) {
        console.error('Error al cargar horas disponibles:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los horarios.",
          variant: "destructive"
        });
        setHorasDisponibles([]);
      } finally {
        setCargandoHorarios(false);
      }
    };
    
    if (negocioId && servicioId && fecha) {
      cargarHorasDisponibles();
    } else {
      setHorasDisponibles([]);
    }
  }, [negocioId, servicioId, fecha, toast]);

  return {
    horasDisponibles,
    diasDisponibles,
    diasSeleccionablesMes,
    cargandoHorarios,
    isLoading,
    cargarDiasDisponibles,
    handleMonthChange
  };
};
