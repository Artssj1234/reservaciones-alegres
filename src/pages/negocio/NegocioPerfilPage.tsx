
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const NegocioPerfilPage = () => {
  const { auth, updateNegocio } = useAuth();
  const { toast } = useToast();
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const slug = auth.negocio?.slug || 'mi-negocio';
  const shareUrl = `${window.location.origin}/${slug}/cita`;
  
  // Datos del perfil del negocio
  const [formData, setFormData] = useState({
    nombre: auth.negocio?.nombre || 'Mi Negocio',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '******',
    nuevaContrasena: '',
    confirmarContrasena: '',
  });
  
  const [cambiarContrasena, setCambiarContrasena] = useState(false);

  // Cargar datos adicionales del negocio
  useEffect(() => {
    const loadNegocioData = async () => {
      if (!auth.negocio?.id) return;
      
      setIsLoading(true);
      
      try {
        // Aquí cargaríamos datos adicionales del negocio desde Supabase
        // Por ahora solo usamos los datos que ya tenemos en auth
        
        // Para una implementación real, obtenemos datos del perfil del negocio desde Supabase
        setFormData(prev => ({
          ...prev,
          nombre: auth.negocio?.nombre || 'Mi Negocio',
          // Los demás campos se cargarían desde Supabase
        }));
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del perfil. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNegocioData();
  }, [auth.negocio?.id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.negocio?.id || !auth.usuario?.id) {
      toast({
        title: "Error",
        description: "No se encontró información del negocio. Intenta iniciar sesión de nuevo.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar contraseñas si el usuario está cambiando la contraseña
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
    
    setIsSaving(true);
    
    try {
      // Actualizar nombre del negocio
      const { error: negocioError } = await supabase
        .from('negocios')
        .update({ nombre: formData.nombre })
        .eq('id', auth.negocio.id);
        
      if (negocioError) {
        console.error('Error al actualizar el negocio:', negocioError);
        toast({
          title: "Error",
          description: "No se pudo actualizar la información del negocio.",
          variant: "destructive",
        });
        return;
      }
      
      // Si el usuario está cambiando la contraseña, actualizarla
      if (cambiarContrasena && formData.nuevaContrasena) {
        const { error: usuarioError } = await supabase
          .from('usuarios')
          .update({ contrasena: formData.nuevaContrasena })
          .eq('id', auth.usuario.id);
          
        if (usuarioError) {
          console.error('Error al actualizar la contraseña:', usuarioError);
          toast({
            title: "Error",
            description: "No se pudo actualizar la contraseña.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Actualizar los datos en el estado de autenticación
      if (auth.negocio) {
        updateNegocio({
          ...auth.negocio,
          nombre: formData.nombre
        });
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
    } catch (error) {
      console.error('Error al guardar datos del perfil:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar los cambios. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Cargando datos del perfil...</div>
            ) : (
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
                      placeholder="contacto@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+34612345678"
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
                    placeholder="Calle Ejemplo, 123, Madrid"
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
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            )}
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
