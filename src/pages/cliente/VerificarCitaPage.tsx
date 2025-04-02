
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Clock, CalendarSearch, CheckCircle } from 'lucide-react';

const VerificarCitaPage = () => {
  const [telefono, setTelefono] = useState('');
  const [cita, setCita] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerificar = () => {
    if (!telefono.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce un número de teléfono.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // En una aplicación real, esto verificaría la cita en Supabase
    setTimeout(() => {
      // Simulamos encontrar una cita
      const citaEncontrada = {
        id: '123456',
        negocio: 'Peluquería Ejemplo',
        servicio: 'Corte de pelo',
        fecha: '2023-06-20',
        hora_inicio: '10:00',
        hora_fin: '10:30',
        estado: 'aceptada',
      };
      
      setCita(citaEncontrada);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container max-w-xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CalendarSearch className="w-12 h-12 mx-auto text-reserva-primary mb-4" />
          <CardTitle>Verificar estado de cita</CardTitle>
          <CardDescription>
            Introduce tu número de teléfono para verificar el estado de tu cita.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="telefono">Número de teléfono</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: +34612345678"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Introduce el número con el que realizaste la reserva.
            </p>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleVerificar}
            disabled={loading}
          >
            {loading ? "Verificando..." : "Verificar Cita"}
          </Button>
          
          {cita && (
            <div className="mt-8 space-y-4 border-t pt-6">
              <div className="flex justify-center">
                {cita.estado === 'aceptada' ? (
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="font-medium text-lg">
                  Tu cita está {cita.estado === 'pendiente' ? 'pendiente de confirmación' : 
                              cita.estado === 'aceptada' ? 'confirmada' : 
                              'rechazada'}
                </h3>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Detalles de la cita</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-600">Negocio:</p>
                  <p>{cita.negocio}</p>
                  
                  <p className="text-gray-600">Servicio:</p>
                  <p>{cita.servicio}</p>
                  
                  <p className="text-gray-600">Fecha:</p>
                  <p>{new Date(cita.fecha).toLocaleDateString('es-ES')}</p>
                  
                  <p className="text-gray-600">Hora:</p>
                  <p>{cita.hora_inicio} - {cita.hora_fin}</p>
                  
                  <p className="text-gray-600">Estado:</p>
                  <p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                      cita.estado === 'aceptada' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {cita.estado === 'pendiente' ? 'Pendiente' : 
                      cita.estado === 'aceptada' ? 'Aceptada' : 
                      'Rechazada'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificarCitaPage;
