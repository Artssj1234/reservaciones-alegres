
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessByUserId } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import HorariosRecurrentesForm from './components/HorariosRecurrentesForm';
import HorasBloqueadasForm from './components/HorasBloqueadasForm';

const NegocioHorariosPage = () => {
  const { auth } = useAuth();
  const { toast } = useToast();
  
  const { data: negocio, isLoading, error } = useQuery({
    queryKey: ['negocio', auth?.usuario?.id],
    queryFn: async () => {
      if (!auth?.usuario?.id) {
        throw new Error("Usuario no autenticado");
      }
      
      const result = await getBusinessByUserId(auth.usuario.id);
      
      if (!result.success || !result.business) {
        throw new Error(result.message || "Error al cargar datos del negocio");
      }
      
      return result.business;
    },
    enabled: !!auth?.usuario?.id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error || !negocio) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error al cargar datos del negocio. Intenta recargar la página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestionar Horarios</h1>
      
      <HorariosRecurrentesForm negocioId={negocio.id} />
      
      <HorasBloqueadasForm negocioId={negocio.id} />
    </div>
  );
};

export default NegocioHorariosPage;
