
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const RegistroPage = () => {
  const [formData, setFormData] = useState({
    nombre_negocio: '',
    nombre_contacto: '',
    telefono: '',
    correo: '',
    slug: '',
    mensaje_opcional: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si está editando el nombre del negocio, actualizar automáticamente el slug
    if (name === 'nombre_negocio') {
      const slugValue = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({
        ...prev,
        slug: slugValue
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Enviar datos a Supabase
      const { data, error } = await supabase
        .from('solicitudes_negocio')
        .insert([
          {
            nombre_negocio: formData.nombre_negocio,
            nombre_contacto: formData.nombre_contacto,
            telefono: formData.telefono,
            correo: formData.correo,
            slug: formData.slug,
            mensaje_opcional: formData.mensaje_opcional,
            estado: 'pendiente'
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitud enviada",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto.",
      });
      
      setSuccess(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error de registro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-green-600">¡Solicitud Enviada!</CardTitle>
            <CardDescription className="text-center">
              Hemos recibido tu solicitud de registro. El equipo de administración revisará tu solicitud y te contactará pronto.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Mientras tanto, puedes volver a la página principal o contactar con soporte si tienes alguna pregunta.
            </p>
            <Link to="/">
              <Button>Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Solicitud de Registro</h1>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Datos del Negocio</CardTitle>
            <CardDescription>
              Completa el formulario para solicitar acceso a la plataforma. Te contactaremos pronto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_negocio">Nombre del Negocio *</Label>
                <Input
                  id="nombre_negocio"
                  name="nombre_negocio"
                  value={formData.nombre_negocio}
                  onChange={handleChange}
                  placeholder="Ej: Peluquería Estilo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nombre_contacto">Nombre de Contacto *</Label>
                <Input
                  id="nombre_contacto"
                  name="nombre_contacto"
                  value={formData.nombre_contacto}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: +34612345678"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico *</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="contacto@tunegocio.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL Personalizada *</Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 px-3 py-2 rounded-l-md border border-gray-300 text-gray-500">
                    app.com/
                  </span>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="rounded-l-none"
                    placeholder="tu-negocio"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Esta será la URL donde tus clientes podrán reservar citas (sólo letras, números y guiones)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mensaje_opcional">Mensaje (Opcional)</Label>
                <Textarea
                  id="mensaje_opcional"
                  name="mensaje_opcional"
                  value={formData.mensaje_opcional}
                  onChange={handleChange}
                  placeholder="Cualquier información adicional que quieras compartir..."
                  rows={4}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Enviando solicitud..." : "Enviar Solicitud"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes una cuenta? <Link to="/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegistroPage;
