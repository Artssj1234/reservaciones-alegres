
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HorarioDisponible } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import DatePickerCalendar from './DatePickerCalendar';
import TimeSlotGrid from './TimeSlotGrid';
import NoAvailabilityAlert from './NoAvailabilityAlert';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DateTimePickerProps {
  date: Date;
  selectedTime: string;
  diasSeleccionablesMes: Set<string>;
  horasDisponibles: HorarioDisponible[];
  cargandoHorarios: boolean;
  duracionServicio: number;
  error?: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (hora: string) => void;
  onMonthChange: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
  onContactClick?: () => void;
}

const DateTimePicker = ({
  date,
  selectedTime,
  diasSeleccionablesMes,
  horasDisponibles,
  cargandoHorarios,
  duracionServicio,
  error,
  onDateChange,
  onTimeChange,
  onMonthChange,
  onNext,
  onBack,
  onContactClick
}: DateTimePickerProps) => {
  const { toast } = useToast();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(date);
  const [horasDisponiblesFiltered, setHorasDisponiblesFiltered] = useState<HorarioDisponible[]>([]);
  
  useEffect(() => {
    // Actualizar fechaSeleccionada cuando cambia date (para sincronización)
    setFechaSeleccionada(date);
  }, [date]);
  
  // Filter available times to show only those that are actually available
  useEffect(() => {
    if (horasDisponibles && horasDisponibles.length > 0) {
      console.log('Filtrando horarios disponibles:', horasDisponibles);
      // Solo los horarios marcados como disponibles
      const filteredHoras = horasDisponibles.filter(hora => hora.disponible);
      
      // Actualizar el estado con todos los horarios pero mostrando solo los disponibles
      setHorasDisponiblesFiltered(filteredHoras);
      
      // Si el tiempo seleccionado ya no está disponible, limpiarlo
      if (selectedTime && !filteredHoras.some(hora => hora.hora_inicio === selectedTime)) {
        onTimeChange('');
        
        if (selectedTime) {
          toast({
            title: "Información",
            description: "La hora seleccionada ya no está disponible.",
          });
        }
      }
      
      // Informar si no hay horarios disponibles
      if (filteredHoras.length === 0 && !cargandoHorarios) {
        console.log('No se encontraron horarios disponibles en esta fecha');
      }
    } else {
      setHorasDisponiblesFiltered([]);
    }
  }, [horasDisponibles, selectedTime, onTimeChange, cargandoHorarios, toast]);
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      console.log('Fecha seleccionada:', format(newDate, 'yyyy-MM-dd'));
      setFechaSeleccionada(newDate);
      onDateChange(newDate);
      
      // Limpiar hora seleccionada al cambiar de fecha
      if (selectedTime) {
        onTimeChange('');
      }
    }
  };

  // Mensaje claro cuando no hay servicio seleccionado
  if (error && error.includes("selecciona un servicio")) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Selecciona fecha y hora</h2>
        
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="font-medium">
            Por favor, selecciona un servicio antes de consultar la disponibilidad.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button 
            onClick={onNext} 
            disabled={true}
            className="bg-green-500 hover:bg-green-600"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  // Show error message if no available days and not in loading state
  if ((diasSeleccionablesMes.size === 0 && !cargandoHorarios) || error) {
    return <NoAvailabilityAlert 
      cargandoHorarios={false} 
      onBack={onBack} 
      error={error} 
      onContactClick={onContactClick} 
    />;
  }

  if (cargandoHorarios && diasSeleccionablesMes.size === 0) {
    return <NoAvailabilityAlert cargandoHorarios={true} onBack={onBack} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Selecciona fecha y hora</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatePickerCalendar 
          fechaSeleccionada={fechaSeleccionada}
          diasSeleccionablesMes={diasSeleccionablesMes}
          onDateSelect={handleDateSelect}
          onMonthChange={onMonthChange}
        />
        
        <TimeSlotGrid 
          horasDisponiblesFiltered={horasDisponiblesFiltered}
          selectedTime={selectedTime}
          onTimeChange={onTimeChange}
          cargandoHorarios={cargandoHorarios}
          fecha={fechaSeleccionada}
          onContactClick={onContactClick}
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedTime || horasDisponiblesFiltered.length === 0}
          className="bg-green-500 hover:bg-green-600"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default DateTimePicker;
