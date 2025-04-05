
import React from 'react';
import { Loader2, AlertCircle, Clock, CalendarX, PhoneCall } from 'lucide-react';
import { HorarioDisponible } from '@/types';
import { Button } from '@/components/ui/button';

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

  if (horasDisponiblesFiltered.length === 0) {
    return (
      <div className="border rounded-md p-6 bg-gray-50 h-72 flex flex-col items-center justify-center">
        <CalendarX className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-gray-700 text-center font-medium text-lg">
          No se encontró disponibilidad
        </p>
        <p className="text-sm text-gray-500 text-center mt-2 mb-4 max-w-md">
          Por favor selecciona otra fecha, otro servicio o contacta directamente con el negocio para más opciones.
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

  // Count available slots for better UX feedback
  const availableSlots = horasDisponiblesFiltered.filter(hora => hora.disponible).length;

  return (
    <div className="border rounded-md p-4 h-72 overflow-y-auto">
      <h3 className="font-medium text-lg mb-3">
        Horarios disponibles para {fecha ? formatDate(fecha) : ''}
      </h3>
      
      {availableSlots === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 py-4">
          <CalendarX className="h-8 w-8 text-amber-500 mb-2" />
          <p className="text-gray-700 font-medium mb-1">
            No hay horas disponibles en esta fecha
          </p>
          <p className="text-sm text-gray-500 text-center max-w-md mb-4">
            Por favor selecciona otra fecha o contacta con el negocio.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-sm border-amber-300 hover:bg-amber-50 text-amber-600"
            onClick={onContactClick}
          >
            <PhoneCall className="h-4 w-4" />
            Contactar al negocio
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">
            {availableSlots} {availableSlots === 1 ? 'horario disponible' : 'horarios disponibles'}
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {horasDisponiblesFiltered.map((hora, index) => (
              <button
                key={index}
                className={`p-3 rounded-md flex flex-col items-center justify-center transition-colors ${
                  !hora.disponible 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                    : selectedTime === hora.hora_inicio
                      ? 'bg-green-500 text-white font-medium'
                      : 'border hover:border-green-500 hover:bg-green-50'
                }`}
                onClick={() => hora.disponible && onTimeChange(hora.hora_inicio)}
                disabled={!hora.disponible}
                title={hora.disponible ? 'Disponible' : hora.estado || 'No disponible'}
              >
                <Clock className={`h-4 w-4 mb-1 ${
                  !hora.disponible 
                    ? 'text-gray-400' 
                    : selectedTime === hora.hora_inicio 
                      ? 'text-white' 
                      : 'text-gray-500'
                }`} />
                <span className="text-center">{hora.hora_inicio.substring(0, 5)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TimeSlotGrid;
