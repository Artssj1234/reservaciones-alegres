
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoAvailabilityAlertProps {
  cargandoHorarios: boolean;
  onBack: () => void;
}

const NoAvailabilityAlert = ({ cargandoHorarios, onBack }: NoAvailabilityAlertProps) => {
  if (cargandoHorarios) {
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
      
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          No se pudo cargar la disponibilidad. Intenta más tarde.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button disabled>Siguiente</Button>
      </div>
    </div>
  );
};

export default NoAvailabilityAlert;
