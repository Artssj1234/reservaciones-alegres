
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceSelectorProps {
  servicios: any[];
  selectedServiceId: string;
  onServiceChange: (servicioId: string) => void;
  onNext?: () => void;
}

const ServiceSelector = ({ servicios, selectedServiceId, onServiceChange, onNext }: ServiceSelectorProps) => {
  if (servicios.length === 0) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-medium mb-4">No hay servicios disponibles</h2>
        <p className="text-gray-500">
          Este negocio no tiene servicios configurados actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-center">Selecciona un servicio</h1>
        <p className="text-center text-gray-600">Elige el servicio para el cual deseas reservar una cita</p>
      </div>
      
      <div className="space-y-3">
        {servicios.map(servicio => (
          <Card 
            key={servicio.id} 
            className={`transition-all hover:shadow-md cursor-pointer ${
              selectedServiceId === servicio.id ? 'border-green-500 border-2 bg-green-50' : ''
            }`}
            onClick={() => onServiceChange(servicio.id)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-2 md:mb-0">
                  <h3 className="font-medium text-lg">{servicio.nombre}</h3>
                  {servicio.descripcion && (
                    <p className="text-gray-600 text-sm mt-1">{servicio.descripcion}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
                    <Clock className="h-3 w-3" />
                    {servicio.duracion_minutos} min
                  </Badge>
                  
                  {servicio.precio && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
                      <DollarSign className="h-3 w-3" />
                      {servicio.precio}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between pt-4">
        <div></div> {/* Empty div to maintain space */}
        <Button 
          onClick={onNext} 
          disabled={!selectedServiceId || !onNext} 
          className="bg-green-500 hover:bg-green-600"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelector;
