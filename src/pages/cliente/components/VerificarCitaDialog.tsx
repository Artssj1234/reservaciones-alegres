
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface VerificarCitaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  telefono: string;
  onTelefonoChange: (telefono: string) => void;
  citasEncontradas: any[];
  onVerificar: () => void;
}

const VerificarCitaDialog = ({
  open,
  onOpenChange,
  telefono,
  onTelefonoChange,
  citasEncontradas,
  onVerificar
}: VerificarCitaDialogProps) => {
  
  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), 'dd/MM/yyyy');
    } catch (e) {
      return fechaStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar estado de cita</DialogTitle>
          <DialogDescription>
            Introduce el número de teléfono con el que realizaste la reserva.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verificar-telefono">Teléfono</Label>
            <Input
              id="verificar-telefono"
              value={telefono}
              onChange={(e) => onTelefonoChange(e.target.value)}
              placeholder="Ej: +34612345678"
            />
          </div>
          
          {citasEncontradas.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="font-medium">Citas encontradas:</h3>
              
              {citasEncontradas.map((cita, index) => (
                <div key={index} className="border rounded-md p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-gray-600">Negocio:</p>
                    <p>{cita.negocios?.nombre || 'No especificado'}</p>
                    
                    <p className="text-gray-600">Servicio:</p>
                    <p>{cita.servicios?.nombre || 'No especificado'}</p>
                    
                    <p className="text-gray-600">Fecha:</p>
                    <p>{formatFecha(cita.fecha)}</p>
                    
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
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          {citasEncontradas.length === 0 ? (
            <Button onClick={onVerificar}>
              Verificar
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {citasEncontradas.length > 0 ? 'Cerrar' : 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificarCitaDialog;
