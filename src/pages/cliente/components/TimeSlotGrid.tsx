
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { HorarioDisponible } from '@/types';

interface TimeSlotGridProps {
  horasDisponiblesFiltered: HorarioDisponible[];
  selectedTime: string;
  onTimeChange: (hora: string) => void;
  cargandoHorarios: boolean;
}

const TimeSlotGrid = ({
  horasDisponiblesFiltered,
  selectedTime,
  onTimeChange,
  cargandoHorarios
}: TimeSlotGridProps) => {
  if (cargandoHorarios) {
    return (
      <div className="border rounded-md p-4 flex items-center justify-center h-72">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-500" />
        <p className="text-gray-600">Cargando horarios disponibles...</p>
      </div>
    );
  }

  if (horasDisponiblesFiltered.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-gray-50 h-72 flex flex-col items-center justify-center">
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
      <div className="grid grid-cols-2 gap-2">
        {horasDisponiblesFiltered.map((hora, index) => {
          const horaFin = hora.hora_fin;
          
          return (
            <div
              key={index}
              className={`p-2 border rounded text-center cursor-pointer transition-colors ${
                selectedTime === hora.hora_inicio
                  ? 'border-blue-600 bg-blue-50 font-medium'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => onTimeChange(hora.hora_inicio)}
            >
              <div>
                {hora.hora_inicio}
              </div>
              <div className="text-xs text-gray-500">
                hasta {horaFin}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
