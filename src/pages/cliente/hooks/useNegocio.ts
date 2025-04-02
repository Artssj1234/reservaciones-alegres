
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getNegocioBySlug, getServiciosByNegocioId } from '@/integrations/supabase/client';

export const useNegocio = (slug: string | undefined) => {
  const [negocio, setNegocio] = useState<any>(null);
  const [servicios, setServicios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setIsLoading(true);
        
        if (!slug) {
          console.error('No se encontró slug en la URL');
          toast({
            title: "Error",
            description: "URL inválida. No se pudo identificar el negocio.",
            variant: "destructive",
          });
          return;
        }

        console.log('Obteniendo negocio por slug:', slug);
        const negocioResult = await getNegocioBySlug(slug);
        
        if (!negocioResult.success || !negocioResult.data) {
          toast({
            title: "Error",
            description: "No se encontró el negocio solicitado.",
            variant: "destructive",
          });
          return;
        }
        
        setNegocio(negocioResult.data);
        
        console.log('Obteniendo servicios para negocio ID:', negocioResult.data.id);
        const serviciosResult = await getServiciosByNegocioId(negocioResult.data.id);
        
        if (serviciosResult.success) {
          const serviciosActivos = serviciosResult.data.filter((s: any) => s.activo);
          setServicios(serviciosActivos);
          
          if (serviciosActivos.length === 0) {
            toast({
              title: "Información",
              description: "Este negocio aún no tiene servicios disponibles para reserva.",
            });
          }
        } else {
          console.error('Error al cargar servicios:', serviciosResult.message);
          toast({
            title: "Error",
            description: "Ocurrió un error al cargar los servicios.",
            variant: "destructive",
          });
        }
        
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarDatosIniciales();
  }, [slug, toast]);

  return {
    negocio,
    servicios,
    isLoading
  };
};
