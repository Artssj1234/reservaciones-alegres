
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Info } from 'lucide-react';
import { isAfter, isBefore, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

interface DatePickerCalendarProps {
  fechaSeleccionada: Date | undefined;
  diasSeleccionablesMes: Set<string>;
  onDateSelect: (date: Date | undefined) => void;
  onMonthChange: (date: Date) => void;
}

const DatePickerCalendar = ({
  fechaSeleccionada,
  diasSeleccionablesMes,
  onDateSelect,
  onMonthChange
}: DatePickerCalendarProps) => {
  const hoy = new Date();
  const limiteMaximo = addMonths(hoy, 2);

  const esDiaDisponible = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAvailable = diasSeleccionablesMes.has(dateStr);
    return isAvailable;
  };

  if (diasSeleccionablesMes.size === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Info className="mx-auto h-6 w-6 text-blue-500 mb-3" />
        <p className="text-gray-700 font-medium">No hay horarios disponibles</p>
        <p className="text-sm text-gray-500 mt-1">
          Por favor intenta más tarde o contacta con el negocio directamente.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-white">
      <h3 className="font-medium text-lg mb-4">Selecciona un día</h3>
      <Calendar
        mode="single"
        selected={fechaSeleccionada}
        onSelect={onDateSelect}
        onMonthChange={onMonthChange}
        disabled={(date) => {
          // Deshabilitar fechas pasadas y más de 2 meses en el futuro
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isBefore(date, today) || isAfter(date, limiteMaximo)) {
            return true;
          }
          
          // Verificar disponibilidad según los días disponibles
          return !esDiaDisponible(date);
        }}
        locale={es}
        initialFocus
        className="p-3 pointer-events-auto"
        classNames={{
          day_selected: "bg-green-500 text-white hover:bg-green-600 hover:text-white focus:bg-green-500 focus:text-white",
          day_today: "bg-gray-100 text-black",
          head_cell: "text-gray-500 font-medium"
        }}
      />
    </div>
  );
};

export default DatePickerCalendar;
