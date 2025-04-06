
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Search, Calendar, Clock, ChevronLeft } from 'lucide-react';
import { buscarCitasPorTelefono } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const VerificarCitaPage = () => {
  const [telefono, setTelefono] = useState('');
  const [citasEncontradas, setCitasEncontradas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!telefono || telefono.trim() === '') {
      toast({
        title: "Error",
        description: "Por favor, introduce un número de teléfono.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await buscarCitasPorTelefono(telefono.trim());
      
      if (result.success && result.citas && result.citas.length > 0) {
        setCitasEncontradas(result.citas);
      } else {
        setCitasEncontradas([]);
        toast({
          title: "No se encontraron citas",
          description: "No se encontraron citas asociadas a este número de teléfono.",
        });
      }
    } catch (error) {
      console.error('Error al verificar cita:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al verificar la cita. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), 'EEEE, d MMMM yyyy', { locale: es });
    } catch (e) {
      return fechaStr;
    }
  };
  
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return {
          text: 'Pendiente de confirmación',
          class: 'bg-yellow-100 text-yellow-800'
        };
      case 'aceptada':
        return {
          text: 'Confirmada',
          class: 'bg-green-100 text-green-800'
        };
      case 'rechazada':
        return {
          text: 'Rechazada',
          class: 'bg-red-100 text-red-800'
        };
      default:
        return {
          text: estado,
          class: 'bg-gray-100 text-gray-800'
        };
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Verificar estado de tu cita</h1>
        <p className="text-gray-600 mt-2">
          Introduce tu número de teléfono para ver el estado de tus citas
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700">
            <Search className="mr-2 h-5 w-5" />
            Buscar citas
          </CardTitle>
          <CardDescription>
            Introduce el número de teléfono con el que realizaste la reserva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Número de teléfono</Label>
              <Input
                id="telefono"
                placeholder="Ej: +34612345678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Buscando...' : 'Buscar citas'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {citasEncontradas.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Citas encontradas</h2>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {citasEncontradas.map((cita, index) => {
              const estadoInfo = getEstadoLabel(cita.estado);
              
              return (
                <Card key={index} className="overflow-hidden">
                  <div className={`h-2 ${cita.estado === 'aceptada' ? 'bg-green-500' : cita.estado === 'rechazada' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <CardHeader>
                    <CardTitle>{cita.negocios?.nombre || 'Negocio'}</CardTitle>
                    <CardDescription>{cita.servicios?.nombre || 'Servicio no especificado'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Fecha</div>
                        <div className="text-gray-600">{formatFecha(cita.fecha)}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Hora</div>
                        <div className="text-gray-600">{cita.hora_inicio} - {cita.hora_fin}</div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="font-medium mb-1">Estado</div>
                      <span className={`inline-block px-3 py-1 text-sm rounded-full ${estadoInfo.class}`}>
                        {estadoInfo.text}
                      </span>
                    </div>
                  </CardContent>
                  {cita.negocios?.slug && (
                    <CardFooter className="border-t pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/${cita.negocios.slug}/cita`)}
                        className="w-full"
                      >
                        Reservar otra cita en este negocio
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => navigate('/')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificarCitaPage;
