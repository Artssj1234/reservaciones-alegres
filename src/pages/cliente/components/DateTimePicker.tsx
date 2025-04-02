
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Info, Loader2, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, addMonths, startOfMonth, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { HorarioDisponible } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface DateTimePickerProps {
  date: Date;
  selectedTime: string;
  diasSeleccionablesMes: Set<string>;
  horasDisponibles: HorarioDisponible[];
  cargandoHorarios: boolean;
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
  onDateChange,
  onTimeChange,
  onMonthChange,
  onNext,
  onBack
}: DateTimePickerProps) => {
  const { toast } = useToast();
  const hoy = new Date();
  const limiteMaximo = addMonths(hoy, 2);
  const currentMonth = startOfMonth(date);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(date);
  
  // Debug logging
  console.log('DateTimePicker render:', {
    date,
    selectedTime,
    diasSeleccionablesCount: diasSeleccionablesMes.size,
    diasDisponibles: Array.from(diasSeleccionablesMes),
    horasDisponiblesCount: horasDisponibles.length,
    currentDayOfWeek: format(date, 'EEEE', { locale: es }),
  });

  const handleMonthChangeDebug = (newDate: Date) => {
    console.log('Month changed:', {
      from: format(currentMonth, 'yyyy-MM'),
      to: format(startOfMonth(newDate), 'yyyy-MM'),
      newDate: format(newDate, 'yyyy-MM-dd')
    });
    onMonthChange(newDate);
  };
  
  const esDiaDisponible = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAvailable = diasSeleccionablesMes.has(dateStr);
    console.log(`Checking availability for ${dateStr}: ${isAvailable}`);
    return isAvailable;
  };
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      console.log('Date selected:', format(newDate, 'yyyy-MM-dd'));
      setFechaSeleccionada(newDate);
      onDateChange(newDate);
    }
  };

  // Mostrar el indicador de carga mientras se está cargando el mes
  if (cargandoHorarios && diasSeleccionablesMes.size === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-center">Selecciona fecha y hora</h2>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">Cargando disponibilidad...</p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button disabled>Siguiente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-center">Selecciona fecha y hora</h2>
      
      {diasSeleccionablesMes.size === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <Info className="mx-auto h-10 w-10 text-blue-500 mb-3" />
          <p className="text-gray-700">Este negocio no tiene horarios disponibles configurados para este mes.</p>
          <p className="text-sm text-gray-500 mt-1">Prueba con otro mes o contacta directamente con el negocio.</p>
        </div>
      )}
      
      {diasSeleccionablesMes.size > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Fecha</Label>
            <div className="border rounded-md p-3">
              <Calendar
                mode="single"
                selected={fechaSeleccionada}
                onSelect={handleDateSelect}
                onMonthChange={handleMonthChangeDebug}
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
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Hora Disponible</Label>
            {cargandoHorarios ? (
              <div className="border rounded-md p-4 flex items-center justify-center h-72">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-500" />
                <p className="text-gray-600">Cargando horarios disponibles...</p>
              </div>
            ) : horasDisponibles.length === 0 ? (
              <div className="border rounded-md p-4 bg-gray-50 h-72 flex flex-col items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                <p className="text-gray-700 text-center font-medium">
                  No hay horas disponibles
                </p>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Por favor selecciona otra fecha o contacta directamente con el negocio
                </p>
              </div>
            ) : (
              <div className="border rounded-md p-4 h-72 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {horasDisponibles.filter(hora => hora.disponible).map((hora, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded text-center cursor-pointer transition-colors ${
                        selectedTime === hora.hora_inicio
                          ? 'border-blue-600 bg-blue-50 font-medium'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => onTimeChange(hora.hora_inicio)}
                    >
                      {hora.hora_inicio}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
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
