
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PersonalInfoFormProps {
  formData: {
    nombre_cliente: string;
    telefono_cliente: string;
    fecha: Date;
    hora_inicio: string;
    servicio_id: string;
  };
  servicios: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const PersonalInfoForm = ({ formData, servicios, onChange, onSubmit, onBack }: PersonalInfoFormProps) => {
  const selectedServicio = servicios.find(s => s.id === formData.servicio_id);
  
  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-center">Confirma tus datos</h1>
        <p className="text-center text-gray-600">Completa tus datos para finalizar la reserva</p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-medium text-lg mb-4">Resumen de la reserva</h3>
          
          <div className="space-y-3">
            <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium">{selectedServicio?.nombre}</span>
            </div>
            
            <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
              <span className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                Fecha:
              </span>
              <span className="font-medium">{formatDate(formData.fecha)}</span>
            </div>
            
            <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
              <span className="flex items-center gap-1 text-gray-600">
                <Clock className="h-4 w-4" />
                Hora:
              </span>
              <span className="font-medium">{formData.hora_inicio.substring(0, 5)}</span>
            </div>
            
            {selectedServicio?.duracion_minutos && (
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{selectedServicio.duracion_minutos} minutos</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre_cliente">Nombre completo</Label>
            <Input
              id="nombre_cliente"
              name="nombre_cliente"
              value={formData.nombre_cliente}
              onChange={onChange}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="telefono_cliente">Teléfono</Label>
            <Input
              id="telefono_cliente"
              name="telefono_cliente"
              type="tel"
              value={formData.telefono_cliente}
              onChange={onChange}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Necesitamos tu número para confirmar o modificar tu cita.
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button 
            type="submit" 
            className="bg-green-500 hover:bg-green-600"
            disabled={!formData.nombre_cliente || !formData.telefono_cliente}
          >
            Confirmar cita
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
