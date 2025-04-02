import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDiasDisponibles, getHorariosDisponibles } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function ReservaFlujoCliente({ negocioId }: { negocioId: string }) {
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState<any[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [diasDisponibles, setDiasDisponibles] = useState<Set<string>>(new Set());
  const [horas, setHoras] = useState<any[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [cliente, setCliente] = useState({ nombre: '', telefono: '' });
  const { toast } = useToast();

  useEffect(() => {
    const fetchServicios = async () => {
      const res = await fetch(`/api/negocios/${negocioId}/servicios`);
      const data = await res.json();
      setServicios(data);
    };
    fetchServicios();
  }, [negocioId]);

  useEffect(() => {
    if (step === 2 && servicioSeleccionado) {
      const hoy = new Date();
      getDiasDisponibles(negocioId, hoy.getFullYear(), hoy.getMonth() + 1, servicioSeleccionado.id)
        .then(res => {
          if (res.success) {
            setDiasDisponibles(new Set(res.data.map(d => d.fecha)));
          }
        });
    }
  }, [step, servicioSeleccionado]);

  useEffect(() => {
    if (fechaSeleccionada && servicioSeleccionado) {
      getHorariosDisponibles(negocioId, fechaSeleccionada, servicioSeleccionado.id).then(res => {
        if (res.success) setHoras(res.data);
      });
    }
  }, [fechaSeleccionada, servicioSeleccionado]);

  const crearCita = async () => {
    const res = await fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        negocio_id: negocioId,
        servicio_id: servicioSeleccionado.id,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        cliente,
      }),
    });

    if (res.ok) {
      const { telefono } = await res.json();
      window.location.href = `/citas/${telefono}`;
    } else {
      toast({ title: 'Error', description: 'No se pudo crear la cita', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {step === 1 && (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-bold">Selecciona un servicio</h2>
            {servicios.map(s => (
              <Button key={s.id} onClick={() => { setServicioSeleccionado(s); setStep(2); }}>{s.nombre}</Button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && servicioSeleccionado && (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-bold">Selecciona fecha y hora</h2>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 30 }, (_, i) => {
                const fecha = new Date();
                fecha.setDate(1 + i);
                const fechaStr = format(fecha, 'yyyy-MM-dd');
                const disponible = diasDisponibles.has(fechaStr);
                return (
                  <Button
                    key={fechaStr}
                    onClick={() => setFechaSeleccionada(fechaStr)}
                    variant={disponible ? 'default' : 'outline'}
                    disabled={!disponible}
                  >
                    {fecha.getDate() + i}
                  </Button>
                );
              })}
            </div>

            {fechaSeleccionada && horas.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">Horarios para {fechaSeleccionada}</p>
                <div className="flex flex-wrap gap-2">
                  {horas.filter(h => h.disponible).map(h => (
                    <Button
                      key={h.hora_inicio}
                      onClick={() => setHoraSeleccionada(h.hora_inicio)}
                      variant={horaSeleccionada === h.hora_inicio ? 'default' : 'outline'}
                    >
                      {h.hora_inicio.slice(0, 5)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button onClick={() => setStep(1)}>Atrás</Button>
              {horaSeleccionada && <Button onClick={() => setStep(3)}>Siguiente</Button>}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">Confirma tus datos</h2>
            <Input placeholder="Tu nombre" value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} />
            <Input placeholder="Tu teléfono" value={cliente.telefono} onChange={e => setCliente({ ...cliente, telefono: e.target.value })} />
            <div className="flex justify-between">
              <Button onClick={() => setStep(2)}>Atrás</Button>
              <Button onClick={crearCita}>Confirmar cita</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
