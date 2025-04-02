
import { useState, useEffect } from 'react';
import { Negocio, Servicio } from '@/types';
import { getNegocioBySlug, getServiciosByNegocioId } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useNegocio = (slug: string | undefined) => {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNegocio = async () => {
      if (!slug) {
        setIsLoading(false);
        setError('Negocio no encontrado');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Obteniendo negocio por slug:', slug);
        const result = await getNegocioBySlug(slug);

        if (result.success && result.data) {
          setNegocio(result.data as Negocio);
          await fetchServicios(result.data.id);
        } else {
          setError(result.message || 'No se pudo encontrar el negocio');
          toast({
            title: "Error",
            description: "No se pudo encontrar el negocio especificado.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error al cargar el negocio:', err);
        setError('Error al cargar el negocio');
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar la información del negocio.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchServicios = async (negocioId: string) => {
      try {
        console.log('Obteniendo servicios para negocio ID:', negocioId);
        const result = await getServiciosByNegocioId(negocioId);

        if (result.success && result.data) {
          // Filtrar solo servicios activos
          const serviciosActivos = result.data.filter(servicio => servicio.activo !== false);
          setServicios(serviciosActivos);
          
          if (serviciosActivos.length === 0) {
            toast({
              title: "Información",
              description: "Este negocio no tiene servicios configurados.",
              duration: 5000
            });
          }
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los servicios del negocio.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los servicios.",
          variant: "destructive"
        });
      }
    };

    fetchNegocio();
  }, [slug, toast]);

  return { negocio, servicios, isLoading, error };
};
