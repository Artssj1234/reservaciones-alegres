
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({ message = 'Cargando...' }: LoadingIndicatorProps) => {
  return (
    <div className="flex justify-center items-center min-h-[200px] py-8">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
