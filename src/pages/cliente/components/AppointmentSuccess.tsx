
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Clock, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const selectedServicio = servicios.find(s => s.id === formData.servicio_id);

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">¡Tu cita ha sido confirmada!</h1>
        <p className="text-gray-600">
          Hemos enviado los detalles de tu cita a tu teléfono. Recuerda guardar esta información.
        </p>
      </div>

      <Card className="shadow-sm border-green-100">
        <CardContent className="p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="font-bold text-lg">{negocio.nombre}</h2>
            {negocio.direccion && <p className="text-gray-600 text-sm">{negocio.direccion}</p>}
            {negocio.telefono && <p className="text-gray-600 text-sm">{negocio.telefono}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-medium">{formatDate(formData.fecha)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Hora</p>
                <p className="font-medium">{formData.hora_inicio.substring(0, 5)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Contacto</p>
                <p className="font-medium">{formData.telefono_cliente}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium">Servicio: {selectedServicio?.nombre}</h3>
            {selectedServicio?.duracion_minutos && (
              <p className="text-gray-600 text-sm">Duración: {selectedServicio.duracion_minutos} minutos</p>
            )}
            {selectedServicio?.precio && (
              <p className="text-gray-600 text-sm">Precio: ${selectedServicio.precio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          onClick={onVerificarClick} 
          variant="outline" 
          className="w-full border-green-500 text-green-700 hover:bg-green-50"
        >
          Verificar mi cita
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Referencia de cita: {citaId ? citaId.substring(0, 8).toUpperCase() : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Guarda este código para futuras consultas
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
