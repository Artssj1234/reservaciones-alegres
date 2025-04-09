
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
  const [error, setError] = useState<string | null>(null);
  const [mesActual, setMesActual] = useState<{anio: number, mes: number}>(
    {
      anio: new Date().getFullYear(),
      mes: new Date().getMonth() + 1
    }
  );
  const { toast } = useToast();

  const cargarDiasDisponibles = useCallback(async (anio: number, mes: number) => {
    if (!negocioId) {
      console.log("No negocioId provided, can't load available days");
      return;
    }

    // Validar que haya un servicio seleccionado
    if (!servicioId || servicioId.trim() === '') {
      console.log("No service selected, skipping day availability loading");
      setDiasDisponibles([]);
      setDiasSeleccionablesMes(new Set());
      setError("Por favor, selecciona un servicio antes de consultar la disponibilidad.");
      return;
    }

    try {
      console.log(`Obteniendo días disponibles para negocio ID: ${negocioId} en año: ${anio}, mes: ${mes}, servicio: ${servicioId}`);
      setIsLoading(true);
      setError(null);

      const diasDispResult = await getDiasDisponibles(
        negocioId,
        anio,
        mes,
        servicioId
      );

      if (diasDispResult.success && diasDispResult.data) {
        const dias = diasDispResult.data;
        console.log("Días disponibles recibidos:", dias);
        setDiasDisponibles(dias);

        const fechasDisponibles = new Set<string>();
        dias.forEach(dia => {
          // Solo incluimos días con disponibilidad real
          if (dia.tiene_disponibilidad) {
            fechasDisponibles.add(format(new Date(dia.fecha), 'yyyy-MM-dd'));
          }
        });

        console.log(`Fechas disponibles encontradas: ${fechasDisponibles.size}`, Array.from(fechasDisponibles).join(', '));
        setDiasSeleccionablesMes(fechasDisponibles);

        if (fechasDisponibles.size === 0) {
          console.log("No hay fechas disponibles para este mes");
        }
      } else {
        console.error('Error al cargar días disponibles:', diasDispResult.message);
        setError(diasDispResult.message || "No se pudo cargar la disponibilidad. Intenta más tarde.");
        toast({
          title: "Error",
          description: diasDispResult.message || "No se pudo cargar la disponibilidad. Intenta más tarde.",
          variant: "destructive"
        });
        setDiasDisponibles([]);
        setDiasSeleccionablesMes(new Set());
      }
    } catch (error) {
      console.error('Error en cargarDiasDisponibles:', error);
      setError("Ocurrió un error al cargar la disponibilidad.");
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
  }, [negocioId, servicioId, toast]);

  const handleMonthChange = useCallback((date: Date) => {
    const nuevoAnio = date.getFullYear();
    const nuevoMes = date.getMonth() + 1;

    console.log(`Month changed to: ${nuevoMes}/${nuevoAnio}`);

    if (nuevoAnio !== mesActual.anio || nuevoMes !== mesActual.mes) {
      setMesActual({ anio: nuevoAnio, mes: nuevoMes });
    }
  }, [mesActual]);

  // Efecto para cargar días disponibles al cambiar el mes o negocio
  useEffect(() => {
    if (negocioId) {
      console.log(`Loading availability for business ID ${negocioId} for month ${mesActual.mes}/${mesActual.anio}`);
      setDiasSeleccionablesMes(new Set());
      
      // Solo cargar días disponibles si hay un servicio seleccionado
      if (servicioId && servicioId.trim() !== '') {
        cargarDiasDisponibles(mesActual.anio, mesActual.mes);
      } else {
        setDiasDisponibles([]);
        setDiasSeleccionablesMes(new Set());
        setError("Por favor, selecciona un servicio antes de consultar la disponibilidad.");
      }
    }
  }, [negocioId, mesActual, cargarDiasDisponibles, servicioId]);

  // Efecto para cargar horas disponibles al cambiar la fecha
  useEffect(() => {
    const cargarHorasDisponibles = async () => {
      if (!negocioId || !fecha) {
        console.log("Missing required data: negocioId or fecha");
        setHorasDisponibles([]);
        return;
      }

      // Validar que haya un servicio seleccionado
      if (!servicioId || servicioId.trim() === '') {
        console.log("No service selected, skipping time slot loading");
        setHorasDisponibles([]);
        setError("Por favor, selecciona un servicio antes de consultar la disponibilidad.");
        return;
      }

      try {
        console.log(`Loading time slots for date: ${format(fecha, 'yyyy-MM-dd')}`);
        setCargandoHorarios(true);
        setError(null);

        const fechaFormateada = format(fecha, 'yyyy-MM-dd');
        
        console.log(`Obteniendo horarios para negocio: ${negocioId}, fecha: ${fechaFormateada}, servicio: ${servicioId}`);
        
        const result = await getHorariosDisponibles(
          negocioId,
          fechaFormateada,
          servicioId
        );

        if (result.success && result.data) {
          console.log('Horarios recibidos:', result.data);
          setHorasDisponibles(result.data);

          const horariosDisponibles = result.data.filter(h => h.disponible);
          console.log(`Se encontraron ${horariosDisponibles.length} horarios disponibles de ${result.data.length} totales`);

          if (horariosDisponibles.length === 0 && result.data.length > 0) {
            toast({
              title: "Información",
              description: "No hay horarios disponibles para la fecha seleccionada.",
            });
          }
        } else {
          console.error('Error al cargar horas disponibles:', result.message);
          setError(result.message || "No se pudo cargar los horarios disponibles.");
          toast({
            title: "Error",
            description: result.message || "No se pudo cargar los horarios disponibles.",
            variant: "destructive"
          });
          setHorasDisponibles([]);
        }
      } catch (error) {
        console.error('Error al cargar horas disponibles:', error);
        setError("Ocurrió un error al cargar los horarios.");
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

    // Cargar horarios cuando cambia la fecha o servicio
    if (negocioId && fecha) {
      if (servicioId && servicioId.trim() !== '') {
        cargarHorasDisponibles();
      } else {
        setHorasDisponibles([]);
        setError("Por favor, selecciona un servicio antes de consultar la disponibilidad.");
      }
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
    error,
    cargarDiasDisponibles,
    handleMonthChange
  };
};
