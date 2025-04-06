'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function ReservaFlujoCliente({ negocioId }: { negocioId: string }) {
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(new Date());
  const [bloquesDisponibles, setBloquesDisponibles] = useState<any[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [cliente, setCliente] = useState({ nombre: '', telefono: '' });
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  // 1. Obtener servicios al montar
  useEffect(() => {
    const fetchServicios = async () => {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('negocio_id', negocioId);

      if (error) {
        toast({ title: 'Error', description: 'No se pudieron cargar los servicios.' });
      } else {
        setServicios(data);
      }
    };

    fetchServicios();
  }, [negocioId]);

  // 2. Obtener bloques disponibles al cambiar servicio o fecha
  useEffect(() => {
    const obtenerBloques = async () => {
      if (!servicioSeleccionado || !fechaSeleccionada) return;

      const { data, error } = await supabase.rpc('get_bloques_disponibles', {
        p_negocio_id: negocioId,
        p_servicio_id: servicioSeleccionado.id,
        p_fecha: format(fechaSeleccionada, 'yyyy-MM-dd')
      });

      if (error) {
        console.error(error);
        toast({ title: 'Error', description: 'No se pudieron cargar los horarios disponibles.' });
      } else {
        setBloquesDisponibles(data);
      }
    };

    obtenerBloques();
  }, [servicioSeleccionado, fechaSeleccionada]);

  const handleConfirmar = () => {
    if (!horaSeleccionada || !cliente.nombre || !cliente.telefono) {
      toast({ title: 'Completa todos los campos para continuar.' });
      return;
    }

    // Aquí iría la lógica para insertar la cita
    toast({ title: 'Cita solicitada (simulado)', description: `Hora: ${horaSeleccionada}` });
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Reservar cita</h1>

      {/* Paso 1: seleccionar servicio */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">1. Selecciona un servicio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {servicios.map(serv => (
            <Button
              key={serv.id}
              variant={servicioSeleccionado?.id === serv.id ? 'default' : 'outline'}
              onClick={() => {
                setServicioSeleccionado(serv);
                setBloquesDisponibles([]);
                setHoraSeleccionada('');
              }}
            >
              {serv.nombre}
            </Button>
          ))}
        </div>
      </div>

      {/* Paso 2: seleccionar fecha */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">2. Selecciona una fecha</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fechaSeleccionada ? format(fechaSeleccionada, 'PPP', { locale: es }) : 'Elige una fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fechaSeleccionada}
              onSelect={setFechaSeleccionada}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Paso 3: seleccionar horario */}
      {bloquesDisponibles.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">3. Selecciona un horario</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {bloquesDisponibles.map(b => {
              const label = format(new Date(b.inicio_bloque), 'HH:mm');
              return (
                <Button
                  key={b.inicio_bloque}
                  variant={horaSeleccionada === b.inicio_bloque ? 'default' : 'outline'}
                  onClick={() => setHoraSeleccionada(b.inicio_bloque)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Paso 4: datos del cliente */}
      {horaSeleccionada && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">4. Tus datos</h2>
          <Input
            placeholder="Nombre"
            value={cliente.nombre}
            onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
          />
          <Input
            placeholder="Teléfono"
            value={cliente.telefono}
            onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
          />
          <Button className="w-full" onClick={handleConfirmar}>
            Confirmar cita
          </Button>
        </div>
      )}
    </div>
  );
}

function CalendarIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
