
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Info } from 'lucide-react';
import { format, isAfter, isBefore, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { HorarioDisponible } from '@/types';

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
  const hoy = new Date();
  const limiteMaximo = addMonths(hoy, 2);
  
  const esDiaDisponible = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return diasSeleccionablesMes.has(dateStr);
  };

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
                selected={date}
                onSelect={onDateChange}
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
              />
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Hora Disponible</Label>
            {cargandoHorarios ? (
              <div className="border rounded-md p-4 h-full flex items-center justify-center">
                <p className="text-gray-500">Cargando horarios disponibles...</p>
              </div>
            ) : horasDisponibles.length === 0 ? (
              <div className="border rounded-md p-4 bg-gray-50 h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  No hay horas disponibles para la fecha seleccionada
                </p>
              </div>
            ) : (
              <div className="border rounded-md p-4 h-72 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {horasDisponibles.map((hora, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded text-center cursor-pointer transition-colors ${
                        selectedTime === hora.hora_inicio
                          ? 'border-blue-600 bg-blue-50'
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
