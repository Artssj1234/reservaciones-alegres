
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

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
  const selectedService = servicios.find(s => s.id === formData.servicio_id);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-center">Completa tus datos</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre_cliente">Nombre completo</Label>
          <Input
            id="nombre_cliente"
            name="nombre_cliente"
            value={formData.nombre_cliente}
            onChange={onChange}
            placeholder="Introduce tu nombre"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefono_cliente">Teléfono</Label>
          <Input
            id="telefono_cliente"
            name="telefono_cliente"
            value={formData.telefono_cliente}
            onChange={onChange}
            placeholder="Ej: +34612345678"
            required
          />
          <p className="text-xs text-gray-500">
            Tu número de teléfono te permitirá verificar el estado de tu cita posteriormente.
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mt-6">
          <h3 className="font-medium mb-2">Resumen de tu cita</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <p className="text-gray-600">Servicio:</p>
            <p>{selectedService?.nombre}</p>
            
            <p className="text-gray-600">Fecha:</p>
            <p>{format(formData.fecha, 'dd/MM/yyyy')}</p>
            
            <p className="text-gray-600">Hora:</p>
            <p>{formData.hora_inicio}</p>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button type="submit">
            Confirmar Cita
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
