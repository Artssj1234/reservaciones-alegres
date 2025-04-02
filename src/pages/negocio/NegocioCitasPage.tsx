
import React, { useState } from 'react';
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

// Mock data
const mockCitas = [
  { 
    id: '1', 
    nombre_cliente: 'Juan Pérez', 
    telefono_cliente: '+34612345678',
    servicio: 'Corte de pelo',
    fecha: '2023-06-15',
    hora_inicio: '10:00',
    hora_fin: '10:45',
    estado: 'pendiente',
    creada_en: '2023-06-14T10:30:00'
  },
  { 
    id: '2', 
    nombre_cliente: 'Laura González', 
    telefono_cliente: '+34623456789',
    servicio: 'Peinado',
    fecha: '2023-06-15',
    hora_inicio: '11:30',
    hora_fin: '12:30',
    estado: 'aceptada',
    creada_en: '2023-06-14T09:15:00'
  },
  { 
    id: '3', 
    nombre_cliente: 'Carlos Ruiz', 
    telefono_cliente: '+34634567890',
    servicio: 'Corte y afeitado',
    fecha: '2023-06-15',
    hora_inicio: '16:00',
    hora_fin: '16:30',
    estado: 'pendiente',
    creada_en: '2023-06-14T08:45:00'
  },
  { 
    id: '4', 
    nombre_cliente: 'Ana López', 
    telefono_cliente: '+34645678901',
    servicio: 'Tinte',
    fecha: '2023-06-16',
    hora_inicio: '12:00',
    hora_fin: '13:00',
    estado: 'aceptada',
    creada_en: '2023-06-14T14:20:00'
  },
  { 
    id: '5', 
    nombre_cliente: 'Elena Martínez', 
    telefono_cliente: '+34656789012',
    servicio: 'Corte y peinado',
    fecha: '2023-06-16',
    hora_inicio: '17:30',
    hora_fin: '19:00',
    estado: 'rechazada',
    creada_en: '2023-06-13T11:10:00'
  }
];

// Mock servicios
const mockServicios = [
  { id: '1', nombre: 'Corte de pelo', duracion_minutos: 30 },
  { id: '2', nombre: 'Tinte', duracion_minutos: 60 },
  { id: '3', nombre: 'Peinado', duracion_minutos: 45 },
  { id: '4', nombre: 'Corte y afeitado', duracion_minutos: 45 },
  { id: '5', nombre: 'Corte y peinado', duracion_minutos: 60 }
];

const NegocioCitasPage = () => {
  const [citas, setCitas] = useState(mockCitas);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estados para el formulario de nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    nombre_cliente: '',
    telefono_cliente: '',
    servicio_id: '',
    fecha: '',
    hora_inicio: ''
  });
  
  const { toast } = useToast();

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
      cita.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.telefono_cliente.includes(searchTerm)
    )
    .filter(cita => !filtroFecha || cita.fecha === filtroFecha)
    .filter(cita => filtroEstado === 'todos' || cita.estado === filtroEstado);

  const handleAceptarCita = (id: string) => {
    setCitas(prev => prev.map(cita => 
      cita.id === id ? { ...cita, estado: 'aceptada' } : cita
    ));
    toast({
      title: "Cita aceptada",
      description: "La cita ha sido aceptada exitosamente.",
    });
  };

  const handleRechazarCita = (id: string) => {
    setCitas(prev => prev.map(cita => 
      cita.id === id ? { ...cita, estado: 'rechazada' } : cita
    ));
    toast({
      title: "Cita rechazada",
      description: "La cita ha sido rechazada.",
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaCita(prev => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (value: string) => {
    setNuevaCita(prev => ({ ...prev, servicio_id: value }));
  };

  const handleSubmitNuevaCita = (e: React.FormEvent) => {
    e.preventDefault();
    
    // En una aplicación real, esto se enviaría a Supabase
    const servicio = mockServicios.find(s => s.id === nuevaCita.servicio_id);
    
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
    
    // Calcular hora fin (en una app real, esto se haría con una librería como date-fns)
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    const horaFin = `${Math.floor(totalMinutos / 60).toString().padStart(2, '0')}:${(totalMinutos % 60).toString().padStart(2, '0')}`;
    
    const newCita = {
      id: (citas.length + 1).toString(),
      nombre_cliente: nuevaCita.nombre_cliente,
      telefono_cliente: nuevaCita.telefono_cliente,
      servicio: servicio.nombre,
      fecha: nuevaCita.fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      estado: 'aceptada',
      creada_en: new Date().toISOString()
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

      {/* Filtros */}
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

      {/* Lista de citas */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de citas</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <td className="py-3 px-4">{cita.servicio}</td>
                      <td className="py-3 px-4">
                        <div>{new Date(cita.fecha).toLocaleDateString('es-ES')}</div>
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
        </CardContent>
      </Card>

      {/* Dialog para nueva cita */}
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
                  {mockServicios.map(servicio => (
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
