
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HorarioDisponible } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import DatePickerCalendar from './DatePickerCalendar';
import TimeSlotGrid from './TimeSlotGrid';
import NoAvailabilityAlert from './NoAvailabilityAlert';

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
  onBack
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
      const filteredHoras = horasDisponibles.filter(hora => hora.disponible);
      setHorasDisponiblesFiltered(horasDisponibles); // Mostrar todos pero deshabilitar los no disponibles
      
      // If the currently selected time is no longer available, clear it
      if (selectedTime && !filteredHoras.some(hora => hora.hora_inicio === selectedTime)) {
        onTimeChange('');
      }
    } else {
      setHorasDisponiblesFiltered([]);
    }
  }, [horasDisponibles, selectedTime, onTimeChange]);
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      console.log('Fecha seleccionada:', format(newDate, 'yyyy-MM-dd'));
      setFechaSeleccionada(newDate);
      onDateChange(newDate);
      
      // Clear selected time when changing date
      if (selectedTime) {
        onTimeChange('');
      }
    }
  };

  // Show error message if no available days and not in loading state
  if ((diasSeleccionablesMes.size === 0 && !cargandoHorarios) || error) {
    return <NoAvailabilityAlert cargandoHorarios={false} onBack={onBack} error={error} />;
  }

  if (cargandoHorarios && horasDisponibles.length === 0) {
    return <NoAvailabilityAlert cargandoHorarios={true} onBack={onBack} />;
  }
  
  // Helper function para formatear fecha
  const format = (date: Date, formatStr: string) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

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
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedTime || diasSeleccionablesMes.size === 0}
          className="bg-green-500 hover:bg-green-600"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default DateTimePicker;
