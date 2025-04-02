
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarRange, Clock } from 'lucide-react';

interface AppointmentSuccessProps {
  negocio: any;
  formData: {
    nombre_cliente: string;
    telefono_cliente: string;
    fecha: Date;
    hora_inicio: string;
    servicio_id: string;
  };
  servicios: any[];
  citaId: string | null;
  onVerificarClick: () => void;
}

const AppointmentSuccess = ({ 
  negocio, 
  formData, 
  servicios, 
  citaId,
  onVerificarClick
}: AppointmentSuccessProps) => {
  const servicioSeleccionado = servicios.find(s => s.id === formData.servicio_id);
  
  return (
    <div className="container max-w-xl mx-auto px-4 py-8">
      <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="text-center bg-green-50 p-6">
          <CalendarRange className="w-16 h-16 mx-auto text-green-600" />
          <h2 className="text-2xl font-semibold text-green-700 mt-4">¡Gracias por tu reserva!</h2>
          <p className="text-gray-600 mt-2">
            Hemos recibido tu solicitud de cita correctamente.
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{negocio.nombre}</h3>
              <p className="text-gray-500">
                <span className="font-medium">Servicio:</span> {servicioSeleccionado?.nombre}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha</p>
                <p>{format(formData.fecha, 'EEEE, d MMMM yyyy', { locale: es })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Hora</p>
                <p>{formData.hora_inicio}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500">Estado de la cita</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Pendiente de confirmación
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                Tu cita está <strong>pendiente de confirmación</strong> por parte del negocio.
                Recibirás una confirmación cuando sea aceptada. También puedes verificar el estado
                de tu cita introduciendo tu número de teléfono.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">ID de tu cita:</span> {citaId}
              </p>
            </div>
            
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={onVerificarClick}>
                <Clock className="mr-2 h-4 w-4" />
                Verificar estado de cita
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          variant="ghost" 
          className="text-blue-600 hover:text-blue-800"
          onClick={() => window.location.reload()}
        >
          Reservar otra cita
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
