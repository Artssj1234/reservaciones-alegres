
import React from 'react';
import { Loader2, AlertCircle, Clock, CalendarX, PhoneCall } from 'lucide-react';
import { HorarioDisponible } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimeSlotGridProps {
  horasDisponiblesFiltered: HorarioDisponible[];
  selectedTime: string;
  onTimeChange: (hora: string) => void;
  cargandoHorarios: boolean;
  fecha: Date | undefined;
  onContactClick?: () => void;
}

const TimeSlotGrid = ({
  horasDisponiblesFiltered,
  selectedTime,
  onTimeChange,
  cargandoHorarios,
  fecha,
  onContactClick
}: TimeSlotGridProps) => {
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
    const year = date.getFullYear();
    return `${day} de ${month} ${year}`;
  };
  
  // Group time slots by morning/afternoon for better organization
  const organizeTimeSlots = (slots: HorarioDisponible[]) => {
    const morning: HorarioDisponible[] = [];
    const afternoon: HorarioDisponible[] = [];
    const evening: HorarioDisponible[] = [];
    
    slots.forEach(slot => {
      const hour = parseInt(slot.hora_inicio.split(':')[0], 10);
      
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });
    
    return { morning, afternoon, evening };
  };

  if (cargandoHorarios) {
    return (
      <div className="border rounded-md p-4 flex items-center justify-center h-72 bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
        <p className="text-gray-600">Cargando horarios disponibles...</p>
      </div>
    );
  }

  if (!fecha) {
    return (
      <div className="border rounded-md p-6 bg-gray-50 h-72 flex flex-col items-center justify-center">
        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
        <p className="text-gray-700 text-center font-medium">
          Selecciona una fecha primero
        </p>
        <p className="text-sm text-gray-500 text-center mt-1">
          Por favor selecciona una fecha del calendario para ver las horas disponibles
        </p>
      </div>
    );
  }

  const availableSlots = horasDisponiblesFiltered.filter(hora => hora.disponible);
  
  if (horasDisponiblesFiltered.length === 0 || availableSlots.length === 0) {
    return (
      <div className="border rounded-md p-6 bg-gray-50 h-72 flex flex-col items-center justify-center">
        <CalendarX className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-gray-700 text-center font-medium text-lg">
          No se encontró disponibilidad
        </p>
        <p className="text-sm text-gray-500 text-center mt-2 mb-4 max-w-md">
          {horasDisponiblesFiltered.length === 0 
            ? "No hay horarios configurados para esta fecha." 
            : "Todos los horarios están ocupados para esta fecha."}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-sm border-gray-300 hover:bg-gray-100 hover:text-gray-700"
          onClick={onContactClick}
        >
          <PhoneCall className="h-4 w-4" />
          Contactar al negocio
        </Button>
      </div>
    );
  }

  const { morning, afternoon, evening } = organizeTimeSlots(availableSlots);
  
  const renderTimeSection = (title: string, slots: HorarioDisponible[]) => {
    if (slots.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((hora, index) => (
            <button
              key={index}
              className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                selectedTime === hora.hora_inicio
                  ? 'bg-green-500 text-white font-medium'
                  : 'border hover:border-green-500 hover:bg-green-50'
              }`}
              onClick={() => onTimeChange(hora.hora_inicio)}
              disabled={!hora.disponible}
              title={hora.estado || 'Disponible'}
            >
              <Clock className={`h-3 w-3 mr-1 ${
                selectedTime === hora.hora_inicio ? 'text-white' : 'text-gray-500'
              }`} />
              <span>{hora.hora_inicio.substring(0, 5)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-md p-4 h-72 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg">
          Horarios para {fecha ? formatDate(fecha) : ''}
        </h3>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {availableSlots.length} disponibles
        </Badge>
      </div>
      
      {renderTimeSection('Mañana', morning)}
      {renderTimeSection('Tarde', afternoon)}
      {renderTimeSection('Noche', evening)}
      
      {morning.length === 0 && afternoon.length === 0 && evening.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40">
          <CalendarX className="h-8 w-8 text-amber-500 mb-2" />
          <p className="text-gray-700 font-medium">
            No hay horas disponibles en esta fecha
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-3 gap-2 text-sm border-amber-300 hover:bg-amber-50 text-amber-600"
            onClick={onContactClick}
          >
            <PhoneCall className="h-4 w-4" />
            Contactar al negocio
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeSlotGrid;
