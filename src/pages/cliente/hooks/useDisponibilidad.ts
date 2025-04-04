
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

    try {
      console.log(`Obteniendo días disponibles para negocio ID: ${negocioId} en año: ${anio}, mes: ${mes}, servicio: ${servicioId}`);
      setIsLoading(true);
      setError(null);

      // Asegurarse que servicioId sea undefined si está vacío para que la función en el backend use la duración predeterminada
      const servicioIdParaEnviar = servicioId && servicioId.trim() !== '' ? servicioId : undefined;

      const diasDispResult = await getDiasDisponibles(
        negocioId,
        anio,
        mes,
        servicioIdParaEnviar
      );

      if (diasDispResult.success && diasDispResult.data) {
        const dias = diasDispResult.data;
        console.log("Días disponibles recibidos:", dias);
        setDiasDisponibles(dias);

        const fechasDisponibles = new Set<string>();
        dias.forEach(dia => {
          // Incluimos los días con cualquier tipo de disponibilidad
          if (dia.tiene_disponibilidad || dia.estado === 'disponible' || dia.estado === 'parcialmente_bloqueado') {
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
        setError("No se pudo cargar la disponibilidad. Intenta más tarde.");
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

  useEffect(() => {
    if (negocioId) {
      console.log(`Loading availability for business ID ${negocioId} for month ${mesActual.mes}/${mesActual.anio}`);
      setDiasSeleccionablesMes(new Set());
      cargarDiasDisponibles(mesActual.anio, mesActual.mes);
    }
  }, [negocioId, mesActual, cargarDiasDisponibles]);

  useEffect(() => {
    const cargarHorasDisponibles = async () => {
      if (!negocioId || !fecha) {
        console.log("Missing required data: negocioId or fecha");
        setHorasDisponibles([]);
        return;
      }

      try {
        console.log(`Loading time slots for date: ${format(fecha, 'yyyy-MM-dd')}`);
        setCargandoHorarios(true);
        setError(null);

        const fechaFormateada = format(fecha, 'yyyy-MM-dd');
        // Asegurarse que servicioId sea undefined si está vacío
        const servicioIdParaEnviar = servicioId && servicioId.trim() !== '' ? servicioId : undefined;

        console.log(`Obteniendo horarios para negocio: ${negocioId}, fecha: ${fechaFormateada}, servicio: ${servicioIdParaEnviar || 'no especificado'}`);
        
        // Agregar console.log para verificar los parámetros exactos que enviamos a la RPC
        const parametrosRPC = {
          negocioId,
          fechaFormateada,
          servicioId: servicioIdParaEnviar
        };
        console.log('Llamando RPC con:', parametrosRPC);
        
        const result = await getHorariosDisponibles(
          negocioId,
          fechaFormateada,
          servicioIdParaEnviar
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
          setError("No se pudo cargar los horarios disponibles.");
          toast({
            title: "Error",
            description: "No se pudo cargar los horarios disponibles.",
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

    if (negocioId && fecha && (servicioId || servicioId === '')) {
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
    error,
    cargarDiasDisponibles,
    handleMonthChange
  };
};
