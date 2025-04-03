
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { HorarioDisponible } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
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
      
      console.log(`Filtered available times: ${filteredHoras.length} of ${horasDisponibles.length} total slots`);
      
      // If the currently selected time is no longer available, clear it
      if (selectedTime && !filteredHoras.some(hora => hora.hora_inicio === selectedTime)) {
        console.log(`Selected time ${selectedTime} is no longer available`);
        onTimeChange('');
      }
    } else {
      setHorasDisponiblesFiltered([]);
    }
  }, [horasDisponibles, selectedTime, onTimeChange]);

  const handleMonthChangeDebug = (newDate: Date) => {
    console.log('Month changed:', {
      newDate: newDate
    });
    onMonthChange(newDate);
  };
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      console.log('Date selected:', newDate);
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
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-center">Selecciona fecha y hora</h2>
      
      <div className="flex justify-center">
        <Badge variant="outline" className="bg-blue-50">
          <Clock className="h-3 w-3 mr-1" />
          Duración del servicio: {duracionServicio} minutos
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Fecha</Label>
          <div className="border rounded-md p-3">
            <DatePickerCalendar 
              fechaSeleccionada={fechaSeleccionada}
              diasSeleccionablesMes={diasSeleccionablesMes}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChangeDebug}
            />
          </div>
        </div>
        
        <div>
          <Label className="mb-2 block">Hora Disponible</Label>
          <TimeSlotGrid 
            horasDisponiblesFiltered={horasDisponiblesFiltered}
            selectedTime={selectedTime}
            onTimeChange={onTimeChange}
            cargandoHorarios={cargandoHorarios}
          />
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedTime || diasSeleccionablesMes.size === 0}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default DateTimePicker;
