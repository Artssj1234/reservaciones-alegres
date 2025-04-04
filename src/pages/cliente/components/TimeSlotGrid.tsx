
import React from 'react';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { HorarioDisponible } from '@/types';

interface TimeSlotGridProps {
  horasDisponiblesFiltered: HorarioDisponible[];
  selectedTime: string;
  onTimeChange: (hora: string) => void;
  cargandoHorarios: boolean;
  fecha: Date | undefined;
}

const TimeSlotGrid = ({
  horasDisponiblesFiltered,
  selectedTime,
  onTimeChange,
  cargandoHorarios,
  fecha
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
        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
        <p className="text-gray-700 text-center font-medium">
          No hay horas disponibles
        </p>
        <p className="text-sm text-gray-500 text-center mt-1">
          Por favor selecciona otra fecha o contacta directamente con el negocio
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 h-72 overflow-y-auto">
      <h3 className="font-medium text-lg mb-4">
        Horarios disponibles para {fecha ? formatDate(fecha) : ''}
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {horasDisponiblesFiltered.map((hora, index) => (
          <button
            key={index}
            className={`p-3 rounded-md flex flex-col items-center justify-center transition-colors ${
              selectedTime === hora.hora_inicio
                ? 'bg-green-500 text-white font-medium'
                : 'border hover:border-green-500 hover:bg-green-50'
            }`}
            onClick={() => onTimeChange(hora.hora_inicio)}
            disabled={!hora.disponible}
            title={hora.disponible ? 'Disponible' : hora.estado || 'No disponible'}
          >
            <Clock className={`h-4 w-4 mb-1 ${selectedTime === hora.hora_inicio ? 'text-white' : 'text-gray-500'}`} />
            <span className="text-center">{hora.hora_inicio.substring(0, 5)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
