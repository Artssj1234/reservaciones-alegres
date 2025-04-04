
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
  onDateChange,
  onTimeChange,
  onMonthChange,
  onNext,
  onBack
}: DateTimePickerProps) => {
  const { toast } = useToast();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(date);
  const [horasDisponiblesFiltered, setHorasDisponiblesFiltered] = useState<HorarioDisponible[]>([]);
  
  // Filter available times to show only those that are actually available
  useEffect(() => {
    if (horasDisponibles && horasDisponibles.length > 0) {
      const filteredHoras = horasDisponibles.filter(hora => hora.disponible);
      setHorasDisponiblesFiltered(filteredHoras);
      
      // If the currently selected time is no longer available, clear it
      if (selectedTime && !filteredHoras.some(hora => hora.hora_inicio === selectedTime)) {
        onTimeChange('');
      }
    } else {
      setHorasDisponiblesFiltered([]);
    }
  }, [horasDisponibles, selectedTime, onTimeChange]);

  const handleMonthChangeDebug = (newDate: Date) => {
    onMonthChange(newDate);
  };
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setFechaSeleccionada(newDate);
      onDateChange(newDate);
      
      // Clear selected time when changing date
      if (selectedTime) {
        onTimeChange('');
      }
    }
  };

  // Show error message if no available days and not in loading state
  if (diasSeleccionablesMes.size === 0 && !cargandoHorarios) {
    return <NoAvailabilityAlert cargandoHorarios={false} onBack={onBack} />;
  }

  if (cargandoHorarios && horasDisponibles.length === 0) {
    return <NoAvailabilityAlert cargandoHorarios={true} onBack={onBack} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-center">Reserva tu cita</h1>
          <p className="text-center text-gray-600">Selecciona la fecha y hora que prefieras para tu cita</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePickerCalendar 
            fechaSeleccionada={fechaSeleccionada}
            diasSeleccionablesMes={diasSeleccionablesMes}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChangeDebug}
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
    </div>
  );
};

export default DateTimePicker;
