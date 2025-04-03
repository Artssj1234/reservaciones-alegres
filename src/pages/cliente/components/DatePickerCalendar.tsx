
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
    console.log(`Checking availability for ${dateStr}: ${isAvailable}`);
    return isAvailable;
  };

  if (diasSeleccionablesMes.size === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <Info className="mx-auto h-6 w-6 text-blue-500 mb-3" />
        <p className="text-gray-700">No hay horarios configurados para este mes.</p>
        <p className="text-sm text-gray-500 mt-1">
          El negocio debe configurar los horarios regulares en la sección de administración.
        </p>
      </div>
    );
  }

  return (
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
    />
  );
};

export default DatePickerCalendar;
