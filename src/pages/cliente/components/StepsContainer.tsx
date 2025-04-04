
import React, { ReactNode } from 'react';
import StepsIndicator from './StepsIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface StepsContainerProps {
  children: ReactNode;
  title: string;
  currentStep: number;
  onVerificarClick: () => void;
}

const StepsContainer = ({ children, title, currentStep, onVerificarClick }: StepsContainerProps) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-green-600">{title}</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 border-green-500 text-green-700 hover:bg-green-50"
            onClick={onVerificarClick}
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Verificar cita</span>
          </Button>
        </div>
        
        <StepsIndicator currentStep={currentStep} />
      </header>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>©️ {new Date().getFullYear()} Gestión de Citas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default StepsContainer;
