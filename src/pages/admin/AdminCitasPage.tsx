
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockCitas = [
  { 
    id: '1', 
    negocio: 'Peluquería Moderna',
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
    negocio: 'Salón de Belleza María',
    nombre_cliente: 'Laura González', 
    telefono_cliente: '+34623456789',
    servicio: 'Manicura',
    fecha: '2023-06-15',
    hora_inicio: '11:30',
    hora_fin: '12:30',
    estado: 'aceptada',
    creada_en: '2023-06-14T09:15:00'
  },
  { 
    id: '3', 
    negocio: 'Barbería Clásica',
    nombre_cliente: 'Carlos Ruiz', 
    telefono_cliente: '+34634567890',
    servicio: 'Afeitado tradicional',
    fecha: '2023-06-15',
    hora_inicio: '16:00',
    hora_fin: '16:30',
    estado: 'pendiente',
    creada_en: '2023-06-14T08:45:00'
  },
  { 
    id: '4', 
    negocio: 'Centro de Estética Bella',
    nombre_cliente: 'Ana López', 
    telefono_cliente: '+34645678901',
    servicio: 'Limpieza facial',
    fecha: '2023-06-16',
    hora_inicio: '12:00',
    hora_fin: '13:00',
    estado: 'aceptada',
    creada_en: '2023-06-14T14:20:00'
  },
  { 
    id: '5', 
    negocio: 'Nails & Beauty',
    nombre_cliente: 'Elena Martínez', 
    telefono_cliente: '+34656789012',
    servicio: 'Uñas de gel',
    fecha: '2023-06-16',
    hora_inicio: '17:30',
    hora_fin: '19:00',
    estado: 'rechazada',
    creada_en: '2023-06-13T11:10:00'
  }
];

const AdminCitasPage = () => {
  const [citas, setCitas] = useState(mockCitas);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const { toast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltroEstado = (estado: string) => {
    setFiltroEstado(estado);
  };

  const handleFiltroFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroFecha(e.target.value);
  };

  const filteredCitas = citas
    .filter(cita => 
      cita.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.telefono_cliente.includes(searchTerm)
    )
    .filter(cita => filtroEstado === 'todos' || cita.estado === filtroEstado)
    .filter(cita => !filtroFecha || cita.fecha === filtroFecha);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Todas las Citas</h1>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar citas..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <Select value={filtroEstado} onValueChange={handleFiltroEstado}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="aceptada">Aceptadas</SelectItem>
            <SelectItem value="rechazada">Rechazadas</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="date"
            className="pl-8"
            value={filtroFecha}
            onChange={handleFiltroFecha}
          />
        </div>
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
                  <th className="py-3 px-4 text-left">Negocio</th>
                  <th className="py-3 px-4 text-left">Servicio</th>
                  <th className="py-3 px-4 text-left">Fecha y Hora</th>
                  <th className="py-3 px-4 text-left">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCitas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
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
                      <td className="py-3 px-4">{cita.negocio}</td>
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
                        <div className="flex justify-end gap-2">
                          {cita.estado === 'pendiente' && (
                            <>
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCitasPage;
