
import React from 'react';
import { AlertCircle, Loader2, CalendarX, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoAvailabilityAlertProps {
  cargandoHorarios: boolean;
  onBack: () => void;
  error?: string;
  onContactClick?: () => void;
}

const NoAvailabilityAlert = ({ cargandoHorarios, onBack, error, onContactClick }: NoAvailabilityAlertProps) => {
  if (cargandoHorarios) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        <h2 className="text-xl font-semibold">Cargando disponibilidad</h2>
        <p className="text-gray-500 max-w-md">
          Estamos consultando la disponibilidad del negocio. Por favor espera un momento...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center">
      {error ? (
        <AlertCircle className="h-16 w-16 text-red-500" />
      ) : (
        <CalendarX className="h-16 w-16 text-amber-500" />
      )}
      
      <h2 className="text-2xl font-bold">
        {error ? 'Ha ocurrido un error' : 'No hay disponibilidad'}
      </h2>
      
      <p className="text-gray-600 max-w-md">
        {error || 'Este negocio no tiene horarios configurados o no hay disponibilidad en este momento. Por favor, intenta seleccionar otra fecha o contacta directamente con el negocio.'}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="min-w-[120px]"
        >
          Volver atrás
        </Button>
        <Button 
          className="bg-green-500 hover:bg-green-600 min-w-[120px]"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
        <Button 
          variant="outline"
          className="min-w-[120px] border-amber-500 text-amber-600 hover:bg-amber-50"
          onClick={onContactClick}
        >
          <PhoneCall className="h-4 w-4 mr-2" />
          Contactar negocio
        </Button>
      </div>
    </div>
  );
};

export default NoAvailabilityAlert;
