
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(usuario, contrasena);
      
      if (success) {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
        
        // Redirigir según el rol (este valor ya viene desde el contexto de Auth)
        if (usuario === 'admin') {
          navigate('/admin');
        } else {
          navigate('/negocio');
        }
      } else {
        toast({
          title: "Error al iniciar sesión",
          description: "Usuario o contraseña incorrectos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Ha ocurrido un error. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error de login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa a tu cuenta para administrar tus reservas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu nombre de usuario"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <div className="text-center">
            <p>Para probar:</p>
            <p>Admin: usuario="admin", contraseña="admin"</p>
            <p>Negocio: usuario="negocio", contraseña="negocio"</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
