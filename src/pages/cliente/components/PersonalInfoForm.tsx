
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface PersonalInfoFormProps {
  formData: {
    nombre_cliente: string;
    telefono_cliente: string;
    servicio_id: string;
    fecha: Date;
    hora_inicio: string;
  };
  servicios: Array<{
    id: string;
    nombre: string;
    descripcion?: string;
    duracion_minutos: number;
    precio?: number;
  }>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const PersonalInfoForm = ({
  formData,
  servicios,
  onChange,
  onSubmit,
  onBack
}: PersonalInfoFormProps) => {
  // Encontrar el servicio seleccionado
  const servicioSeleccionado = servicios.find(s => s.id === formData.servicio_id);
  
  // Calcular la hora de fin basada en la duración del servicio
  const calcularHoraFin = (horaInicio: string, duracionMinutos: number) => {
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const totalMinutos = hora * 60 + minuto + duracionMinutos;
    const horaFin = Math.floor(totalMinutos / 60);
    const minutoFin = totalMinutos % 60;
    return `${String(horaFin).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Tus datos personales</h2>
      
      {servicioSeleccionado && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Resumen de tu cita</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Servicio:</span>
              <span>{servicioSeleccionado.nombre}</span>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <span className="font-medium">Fecha:</span>
                <span className="ml-1">
                  {format(formData.fecha, 'PPP', { locale: es })}
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <span className="font-medium">Horario:</span>
                <span className="ml-1">
                  {formData.hora_inicio} - {calcularHoraFin(formData.hora_inicio, servicioSeleccionado.duracion_minutos)}
                </span>
                <span className="ml-1 text-sm text-gray-500">
                  ({servicioSeleccionado.duracion_minutos} min)
                </span>
              </div>
            </div>
            
            {servicioSeleccionado.precio && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Precio:</span>
                <span>${servicioSeleccionado.precio}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre_cliente" className="block text-sm font-medium mb-1">
            Nombre completo
          </label>
          <Input
            id="nombre_cliente"
            name="nombre_cliente"
            value={formData.nombre_cliente}
            onChange={onChange}
            placeholder="Ej. Juan Pérez"
            required
          />
        </div>
        
        <div>
          <label htmlFor="telefono_cliente" className="block text-sm font-medium mb-1">
            Teléfono de contacto
          </label>
          <Input
            id="telefono_cliente"
            name="telefono_cliente"
            value={formData.telefono_cliente}
            onChange={onChange}
            placeholder="Ej. 612345678"
            type="tel"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Te enviaremos la confirmación de tu cita a este número.
          </p>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button 
            type="submit" 
            className="bg-green-500 hover:bg-green-600 gap-2"
          >
            Confirmar cita
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
