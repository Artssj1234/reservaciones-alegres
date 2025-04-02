
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const NegocioNotFound = () => {
  return (
    <div className="container max-w-xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Negocio no encontrado</CardTitle>
          <CardDescription>
            El negocio que buscas no existe o la URL es incorrecta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Por favor, verifica la dirección o contacta con el negocio para obtener la URL correcta.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NegocioNotFound;
