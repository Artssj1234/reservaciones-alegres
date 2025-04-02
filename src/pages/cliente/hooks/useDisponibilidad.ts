
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getDiasDisponibles, getHorariosDisponibles } from '@/integrations/supabase/client';
import { HorarioDisponible, DiaDisponible } from '@/types';
import { format } from 'date-fns';

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
  }, [negocioId, toast]);

  const handleMonthChange = useCallback((date: Date) => {
    const nuevoAnio = date.getFullYear();
    const nuevoMes = date.getMonth() + 1;
    
    // Solo actualizar si cambia el mes
    if (nuevoAnio !== mesActual.anio || nuevoMes !== mesActual.mes) {
      setMesActual({
        anio: nuevoAnio,
        mes: nuevoMes
      });
    }
  }, [mesActual]);

  useEffect(() => {
    if (negocioId) {
      setDiasSeleccionablesMes(new Set());
      cargarDiasDisponibles(mesActual.anio, mesActual.mes);
    }
  }, [negocioId, mesActual, cargarDiasDisponibles]);

  useEffect(() => {
    const cargarHorasDisponibles = async () => {
      if (!negocioId || !servicioId || !fecha) return;
      
      try {
        setCargandoHorarios(true);
        
        const fechaFormateada = format(fecha, 'yyyy-MM-dd');
        const duracionMinutos = servicioId ? 30 : 30; // Default value if no service selected
        
        console.log(`Obteniendo horarios para negocio: ${negocioId}, fecha: ${fechaFormateada}, duración: ${duracionMinutos}`);
        const result = await getHorariosDisponibles(
          negocioId,
          fechaFormateada,
          duracionMinutos
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
