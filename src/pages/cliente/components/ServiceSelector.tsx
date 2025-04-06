import React from 'react';
import { Check, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServiceSelectorProps {
  servicios: Array<{
    id: string;
    nombre: string;
    descripcion?: string;
    precio?: number;
    duracion_minutos: number;
  }>;
  selectedServiceId: string;
  onServiceChange: (id: string) => void;
  onNext?: () => void;
}

const ServiceSelector = ({ 
  servicios, 
  selectedServiceId, 
  onServiceChange, 
  onNext 
}: ServiceSelectorProps) => {
  
  if (servicios.length === 0) {
    return (
      <div className="space-y-4">
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertDescription>
            Este negocio no tiene servicios configurados. Por favor, intenta más tarde o contacta directamente con el negocio.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Selecciona un servicio</h2>
        <p className="text-center text-gray-500">
          Escoge el servicio para el que deseas agendar una cita.
        </p>
      </div>
      
      <div className="space-y-3 mt-6">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            onClick={() => onServiceChange(servicio.id)}
            className={`
              cursor-pointer border rounded-lg p-4 transition-colors 
              ${selectedServiceId === servicio.id 
                ? 'border-green-500 bg-green-50 shadow-sm' 
                : 'hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium">{servicio.nombre}</h3>
                  {servicio.duracion_minutos > 0 && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-100">
                      <Clock className="h-3 w-3 mr-1" />
                      {servicio.duracion_minutos} min
                    </Badge>
                  )}
                </div>
                
                {servicio.descripcion && (
                  <p className="text-sm text-gray-500 mt-1">{servicio.descripcion}</p>
                )}
                
                {servicio.precio && servicio.precio > 0 && (
                  <p className="text-sm font-semibold mt-1 text-gray-700">
                    {formatCurrency(servicio.precio)}
                  </p>
                )}
              </div>
              
              <div className={`h-5 w-5 flex-shrink-0 rounded-full border ${
                selectedServiceId === servicio.id 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300'
              }`}>
                {selectedServiceId === servicio.id && (
                  <Check className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!selectedServiceId || !onNext}
          className="bg-green-500 hover:bg-green-600 gap-2"
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelector;
