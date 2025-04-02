import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getCitasByNegocioId, 
  getServiciosByNegocioId,
  updateCita,
  createCita
} from '@/integrations/supabase/client';

const NegocioCitasPage = () => {
  const { auth } = useAuth();
  const [citas, setCitas] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [nuevaCita, setNuevaCita] = useState({
    nombre_cliente: '',
    telefono_cliente: '',
    servicio_id: '',
    fecha: '',
    hora_inicio: ''
  });
  
  const { toast } = useToast();
  const negocioId = auth.negocio?.id;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (!negocioId) {
          console.error('No se encontró ID de negocio en la sesión');
          toast({
            title: "Error",
            description: "No se pudo cargar la información del negocio. Intenta iniciar sesión de nuevo.",
            variant: "destructive",
          });
          return;
        }

        const [citasResult, serviciosResult] = await Promise.all([
          getCitasByNegocioId(negocioId),
          getServiciosByNegocioId(negocioId)
        ]);
        
        if (citasResult.success) {
          setCitas(citasResult.data);
        } else {
          console.error('Error al cargar citas:', citasResult.message);
          toast({
            title: "Error",
            description: "No se pudieron cargar las citas. Intenta de nuevo más tarde.",
            variant: "destructive",
          });
        }
        
        if (serviciosResult.success) {
          setServicios(serviciosResult.data);
        } else {
          console.error('Error al cargar servicios:', serviciosResult.message);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [negocioId, toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltroFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroFecha(e.target.value);
  };

  const handleFiltroEstado = (estado: string) => {
    setFiltroEstado(estado);
  };

  const filteredCitas = citas
    .filter(cita => 
      cita.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cita.servicio && cita.servicio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cita.telefono_cliente?.includes(searchTerm)
    )
    .filter(cita => !filtroFecha || cita.fecha === filtroFecha)
    .filter(cita => filtroEstado === 'todos' || cita.estado === filtroEstado);

  const handleAceptarCita = async (id: string) => {
    try {
      const result = await updateCita(id, { estado: 'aceptada' });
      
      if (result.success) {
        setCitas(prev => prev.map(cita => 
          cita.id === id ? { ...cita, estado: 'aceptada' } : cita
        ));
        
        toast({
          title: "Cita aceptada",
          description: "La cita ha sido aceptada exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Ocurrió un error al aceptar la cita.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al aceptar cita:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al aceptar la cita. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const handleRechazarCita = async (id: string) => {
    try {
      const result = await updateCita(id, { estado: 'rechazada' });
      
      if (result.success) {
        setCitas(prev => prev.map(cita => 
          cita.id === id ? { ...cita, estado: 'rechazada' } : cita
        ));
        
        toast({
          title: "Cita rechazada",
          description: "La cita ha sido rechazada.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Ocurrió un error al rechazar la cita.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al rechazar cita:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al rechazar la cita. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaCita(prev => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (value: string) => {
    setNuevaCita(prev => ({ ...prev, servicio_id: value }));
  };

  const verificarDisponibilidad = (fecha: string, horaInicio: string, servicio: any) => {
    const solapada = citas.some(cita => {
      if (cita.estado === 'rechazada' || cita.fecha !== fecha) return false;
      
      const citaInicioMinutos = convertirHoraAMinutos(cita.hora_inicio);
      const citaFinMinutos = convertirHoraAMinutos(cita.hora_fin);
      
      const nuevaInicioMinutos = convertirHoraAMinutos(horaInicio);
      const nuevaFinMinutos = nuevaInicioMinutos + servicio.duracion_minutos;
      
      return (nuevaInicioMinutos < citaFinMinutos && nuevaFinMinutos > citaInicioMinutos);
    });
    
    return !solapada;
  };

  const convertirHoraAMinutos = (hora: string) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  };

  const convertirMinutosAHora = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const handleSubmitNuevaCita = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!negocioId) {
        toast({
          title: "Error",
          description: "No se encontró ID de negocio. Intenta iniciar sesión de nuevo.",
          variant: "destructive",
        });
        return;
      }
      
      const servicio = servicios.find(s => s.id === nuevaCita.servicio_id);
      
      if (!servicio) {
        toast({
          title: "Error",
          description: "Selecciona un servicio válido.",
          variant: "destructive",
        });
        return;
      }
      
      const duracionMinutos = servicio.duracion_minutos;
      const horaInicio = nuevaCita.hora_inicio;
      
      const disponible = verificarDisponibilidad(nuevaCita.fecha, horaInicio, servicio);
      
      if (!disponible) {
        toast({
          title: "Error",
          description: "La hora seleccionada se solapa con otra cita. Por favor, elige otra hora.",
          variant: "destructive",
        });
        return;
      }
      
      const minutosInicio = convertirHoraAMinutos(horaInicio);
      const minutosTotal = minutosInicio + duracionMinutos;
      const horaFin = convertirMinutosAHora(minutosTotal);
      
      const newCitaData = {
        negocio_id: negocioId,
        nombre_cliente: nuevaCita.nombre_cliente,
        telefono_cliente: nuevaCita.telefono_cliente,
        servicio_id: nuevaCita.servicio_id,
        fecha: nuevaCita.fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: 'aceptada'
      };
      
      const result = await createCita(newCitaData);
      
      if (result.success) {
        const newCita = {
          ...result.data,
          servicio: servicio.nombre
        };
        
        setCitas([...citas, newCita]);
        
        toast({
          title: "Cita creada",
          description: "La cita se ha creado correctamente.",
        });
        
        setIsDialogOpen(false);
        setNuevaCita({
          nombre_cliente: '',
          telefono_cliente: '',
          servicio_id: '',
          fecha: '',
          hora_inicio: ''
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Ha ocurrido un error al crear la cita.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al crear cita:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la cita. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const formatFecha = (fechaStr: string) => {
    try {
      return new Date(fechaStr).toLocaleDateString('es-ES');
    } catch (e) {
      return fechaStr;
    }
  };

  const getServicioNombre = (servicioId: string) => {
    const servicio = servicios.find(s => s.id === servicioId);
    return servicio ? servicio.nombre : 'Servicio desconocido';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Citas</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar cliente o servicio..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="date"
            className="pl-8"
            value={filtroFecha}
            onChange={handleFiltroFecha}
          />
        </div>
        
        <Select value={filtroEstado} onValueChange={handleFiltroEstado}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="aceptada">Aceptadas</SelectItem>
            <SelectItem value="rechazada">Rechazadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de citas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Cargando citas...</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left">Cliente</th>
                    <th className="py-3 px-4 text-left">Servicio</th>
                    <th className="py-3 px-4 text-left">Fecha y Hora</th>
                    <th className="py-3 px-4 text-left">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCitas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        No se encontraron citas
                      </td>
                    </tr>
                  ) : (
                    filteredCitas.map((cita) => (
                      <tr key={cita.id} className="border-b">
                        <td className="py-3 px-4">
                          <div className="font-medium">{cita.nombre_cliente}</div>
                          <div className="text-sm text-gray-500">{cita.telefono_cliente}</div>
                        </td>
                        <td className="py-3 px-4">
                          {cita.servicio_id ? getServicioNombre(cita.servicio_id) : cita.servicio || 'Servicio no especificado'}
                        </td>
                        <td className="py-3 px-4">
                          <div>{formatFecha(cita.fecha)}</div>
                          <div className="text-sm text-gray-500">
                            {cita.hora_inicio} - {cita.hora_fin}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                            cita.estado === 'aceptada' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            'bg-red-100 text-red-800 hover:bg-red-100'
                          }>
                            {cita.estado === 'pendiente' ? 'Pendiente' :
                             cita.estado === 'aceptada' ? 'Aceptada' :
                             'Rechazada'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {cita.estado === 'pendiente' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                                onClick={() => handleAceptarCita(cita.id)}
                              >
                                Aceptar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => handleRechazarCita(cita.id)}
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Cita</DialogTitle>
            <DialogDescription>
              Completa los detalles para crear una nueva cita manualmente.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitNuevaCita} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_cliente">Nombre del Cliente</Label>
              <Input
                id="nombre_cliente"
                name="nombre_cliente"
                value={nuevaCita.nombre_cliente}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefono_cliente">Teléfono</Label>
              <Input
                id="telefono_cliente"
                name="telefono_cliente"
                value={nuevaCita.telefono_cliente}
                onChange={handleFormChange}
                placeholder="Ej: +34612345678"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servicio_id">Servicio</Label>
              <Select 
                value={nuevaCita.servicio_id} 
                onValueChange={handleServicioChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map(servicio => (
                    <SelectItem key={servicio.id} value={servicio.id}>
                      {servicio.nombre} ({servicio.duracion_minutos} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={nuevaCita.fecha}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora</Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  value={nuevaCita.hora_inicio}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cita</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NegocioCitasPage;
