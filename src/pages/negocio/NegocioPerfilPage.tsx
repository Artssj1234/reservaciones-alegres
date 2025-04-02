
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { QrCode, Share2, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const NegocioPerfilPage = () => {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  const slug = auth.negocio?.slug || 'mi-negocio';
  const shareUrl = `${window.location.origin}/${slug}/cita`;
  
  // En una aplicación real, estos datos vendrían de Supabase
  const [formData, setFormData] = useState({
    nombre: auth.negocio?.nombre || 'Mi Negocio',
    correo: 'contacto@email.com',
    telefono: '+34612345678',
    direccion: 'Calle Ejemplo, 123, Madrid',
    contrasena: '******',
    nuevaContrasena: '',
    confirmarContrasena: '',
  });
  
  const [cambiarContrasena, setCambiarContrasena] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // En una aplicación real, esto se enviaría a Supabase
    
    // Si el usuario está cambiando la contraseña, verificar que ambas coincidan
    if (cambiarContrasena) {
      if (formData.nuevaContrasena !== formData.confirmarContrasena) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden.",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.nuevaContrasena.length < 6) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 6 caracteres.",
          variant: "destructive",
        });
        return;
      }
    }
    
    toast({
      title: "Perfil actualizado",
      description: "Los cambios han sido guardados correctamente.",
    });
    
    // Resetear campos de contraseña
    setFormData(prev => ({
      ...prev,
      nuevaContrasena: '',
      confirmarContrasena: '',
    }));
    
    setCambiarContrasena(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Perfil del Negocio</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del negocio */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información del Negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Negocio</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
              
              <div className="pt-4 border-t mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCambiarContrasena(!cambiarContrasena)}
                  >
                    {cambiarContrasena ? 'Cancelar' : 'Cambiar'}
                  </Button>
                </div>
                
                {cambiarContrasena && (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="contrasena">Contraseña Actual</Label>
                      <Input
                        id="contrasena"
                        name="contrasena"
                        type="password"
                        value={formData.contrasena}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nuevaContrasena">Nueva Contraseña</Label>
                        <Input
                          id="nuevaContrasena"
                          name="nuevaContrasena"
                          type="password"
                          value={formData.nuevaContrasena}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmarContrasena">Confirmar Contraseña</Label>
                        <Input
                          id="confirmarContrasena"
                          name="confirmarContrasena"
                          type="password"
                          value={formData.confirmarContrasena}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Enlaces y compartir */}
        <Card>
          <CardHeader>
            <CardTitle>Enlace de Reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Tu enlace público para reservas:</Label>
              <div className="flex items-center space-x-2">
                <Input value={shareUrl} readOnly />
                <Button variant="ghost" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Label className="text-sm text-gray-500">Comparte con tus clientes:</Label>
              <div className="flex flex-col space-y-3 mt-3">
                <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Copiar enlace
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsQrDialogOpen(true)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Ver código QR
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Label className="text-sm text-gray-500">Estado de tu cuenta:</Label>
              <div className="mt-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Activa
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para mostrar el código QR */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código QR para reservas</DialogTitle>
            <DialogDescription>
              Tus clientes pueden escanear este código para reservar citas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {/* En una implementación real, aquí se generaría un código QR real */}
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center border">
              <QrCode className="w-32 h-32 text-gray-500" />
              <span className="sr-only">Código QR para {shareUrl}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsQrDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NegocioPerfilPage;
