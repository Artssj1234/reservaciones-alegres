import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Scissors } from 'lucide-react';

interface ServiceSelectorProps {
  servicios: any[];
  selectedServiceId: string;
  onServiceChange: (servicioId: string) => void;
  onNext: () => void;
}

const ServiceSelector = ({ 
  servicios, 
  selectedServiceId, 
  onServiceChange, 
  onNext 
}: ServiceSelectorProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-center">Selecciona un servicio</h2>
      
      <div className="space-y-4">
        {servicios.length === 0 ? (
          <div className="text-center py-8">
            <Scissors className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No hay servicios disponibles en este momento.</p>
            <p className="text-sm text-gray-400 mt-2">Contacta directamente con el negocio para más información.</p>
          </div>
        ) : (
          servicios.map(servicio => (
            <div
              key={servicio.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedServiceId === servicio.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => onServiceChange(servicio.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{servicio.nombre}</h3>
                  <p className="text-sm text-gray-500">Duración: {servicio.duracion_minutos} minutos</p>
                </div>
                {selectedServiceId === servicio.id && (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!selectedServiceId || servicios.length === 0}>
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelector;
