
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <CalendarRange className="h-24 w-24 text-reserva-primary mb-8" />
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-2xl font-semibold mb-2">Página no encontrada</p>
      <p className="text-gray-600 mb-8 max-w-md">
        Lo sentimos, no pudimos encontrar la página que estás buscando.
      </p>
      <Link to="/">
        <Button size="lg" className="bg-reserva-primary hover:bg-blue-600">
          Volver al inicio
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
