
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StepsIndicator from './StepsIndicator';
import { Clock } from 'lucide-react';

interface StepsContainerProps {
  title: string;
  description?: string;
  currentStep: number;
  children: React.ReactNode;
  onVerificarClick?: () => void;
}

const StepsContainer = ({ 
  title, 
  description = 'Reserva tu cita online en unos simples pasos', 
  currentStep, 
  children, 
  onVerificarClick 
}: StepsContainerProps) => {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <StepsIndicator currentStep={currentStep} />
          {children}
        </CardContent>
        {onVerificarClick && (
          <CardFooter className="flex justify-center border-t p-4">
            <Button 
              variant="ghost" 
              onClick={onVerificarClick}
              className="text-sm"
            >
              <Clock className="mr-2 h-4 w-4" />
              Verificar estado de cita
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default StepsContainer;
