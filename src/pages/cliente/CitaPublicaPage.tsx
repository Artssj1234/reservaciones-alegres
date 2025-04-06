
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNegocio } from './hooks/useNegocio';
import { useDisponibilidad } from './hooks/useDisponibilidad';
import { useCitaForm } from './hooks/useCitaForm';

// Components
import ServiceSelector from './components/ServiceSelector';
import DateTimePicker from './components/DateTimePicker';
import PersonalInfoForm from './components/PersonalInfoForm';
import AppointmentSuccess from './components/AppointmentSuccess';
import VerificarCitaDialog from './components/VerificarCitaDialog';
import NegocioNotFound from './components/NegocioNotFound';
import LoadingIndicator from './components/LoadingIndicator';
import StepsContainer from './components/StepsContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PhoneCall, Globe } from 'lucide-react';

const CitaPublicaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { negocio, servicios, isLoading: isLoadingNegocio, error: negocioError } = useNegocio(slug);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const { 
    formData, 
    step, 
    success, 
    citaId, 
    verificarDialogOpen,
    telefono, 
    citasEncontradas,
    setVerificarDialogOpen, 
    setTelefono,
    handleInputChange,
    handleServicioChange,
    handleFechaChange, 
    handleHoraChange, 
    handleNext, 
    handleBack,
    handleSubmit,
    handleVerificarCita,
    handleDialogClose
  } = useCitaForm(negocio?.id);

  const {
    horasDisponibles,
    diasSeleccionablesMes,
    cargandoHorarios,
    isLoading: isLoadingDisponibilidad,
    error: disponibilidadError,
    handleMonthChange
  } = useDisponibilidad(negocio?.id, formData.servicio_id, formData.fecha);

  useEffect(() => {
    if (negocio) {
      console.log("CitaPublicaPage loaded with data:", {
        negocioId: negocio.id,
        serviciosCount: servicios.length,
        step,
        servicio_id: formData.servicio_id,
        fecha: formData.fecha,
        horasDisponiblesCount: horasDisponibles.length,
        diasSeleccionablesCount: diasSeleccionablesMes.size,
        diasSeleccionables: Array.from(diasSeleccionablesMes)
      });
    }
  }, [negocio, servicios, step, formData, horasDisponibles, diasSeleccionablesMes]);

  // Validar duración de servicio
  const selectedService = servicios.find(s => s.id === formData.servicio_id);
  const serviceTieneDuracion = selectedService && selectedService.duracion_minutos > 0;

  // Mostrar error si el servicio seleccionado no tiene duración configurada
  const serviceError = selectedService && !serviceTieneDuracion 
    ? "El servicio seleccionado no tiene una duración configurada. Por favor, contacta al negocio." 
    : null;

  const handleContactClick = () => {
    setContactDialogOpen(true);
  };

  if (isLoadingNegocio && !negocio) {
    return <LoadingIndicator message="Cargando información del negocio..." />;
  }

  if (negocioError || !negocio) {
    return <NegocioNotFound />;
  }

  if (success) {
    return (
      <AppointmentSuccess 
        negocio={negocio}
        formData={formData}
        servicios={servicios}
        citaId={citaId}
        onVerificarClick={() => setVerificarDialogOpen(true)}
      />
    );
  }

  return (
    <>
      <StepsContainer 
        title={negocio.nombre} 
        currentStep={step}
        onVerificarClick={() => setVerificarDialogOpen(true)}
      >
        {servicios.length === 0 && step === 1 && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Este negocio no tiene servicios configurados. Por favor, contacta directamente con el negocio.
            </AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <ServiceSelector 
            servicios={servicios}
            selectedServiceId={formData.servicio_id}
            onServiceChange={handleServicioChange}
            onNext={servicios.length > 0 ? handleNext : undefined}
          />
        )}

        {step === 2 && (
          <>
            {serviceError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  {serviceError}
                </AlertDescription>
              </Alert>
            )}
            
            <DateTimePicker 
              date={formData.fecha}
              selectedTime={formData.hora_inicio}
              diasSeleccionablesMes={diasSeleccionablesMes}
              horasDisponibles={horasDisponibles}
              cargandoHorarios={cargandoHorarios || isLoadingDisponibilidad}
              duracionServicio={selectedService?.duracion_minutos || 30}
              error={disponibilidadError || serviceError}
              onDateChange={handleFechaChange}
              onTimeChange={handleHoraChange}
              onMonthChange={handleMonthChange}
              onNext={handleNext}
              onBack={handleBack}
              onContactClick={handleContactClick}
            />
          </>
        )}

        {step === 3 && (
          <PersonalInfoForm 
            formData={formData}
            servicios={servicios}
            onChange={handleInputChange}
            onSubmit={(e) => handleSubmit(e, servicios)}
            onBack={handleBack}
          />
        )}
      </StepsContainer>

      <VerificarCitaDialog
        open={verificarDialogOpen}
        onOpenChange={handleDialogClose}
        telefono={telefono}
        onTelefonoChange={(value) => setTelefono(value)}
        citasEncontradas={citasEncontradas}
        onVerificar={handleVerificarCita}
      />

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar con {negocio.nombre}</DialogTitle>
            <DialogDescription>
              Si necesitas contactar directamente con el negocio, puedes utilizar los siguientes datos:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {negocio.telefono && (
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-green-600" />
                <span className="font-medium">Teléfono:</span>
                <a href={`tel:${negocio.telefono}`} className="text-blue-600 hover:underline">{negocio.telefono}</a>
              </div>
            )}
            
            {negocio.correo && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Email:</span>
                <a href={`mailto:${negocio.correo}`} className="text-blue-600 hover:underline">{negocio.correo}</a>
              </div>
            )}
            
            {negocio.sitio_web && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Sitio web:</span>
                <a href={negocio.sitio_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{negocio.sitio_web}</a>
              </div>
            )}
            
            {negocio.direccion && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Dirección:</span>
                <span>{negocio.direccion}</span>
              </div>
            )}
            
            {!negocio.telefono && !negocio.correo && !negocio.sitio_web && !negocio.direccion && (
              <p className="text-amber-600">
                Este negocio no ha proporcionado información de contacto.
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setContactDialogOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CitaPublicaPage;
