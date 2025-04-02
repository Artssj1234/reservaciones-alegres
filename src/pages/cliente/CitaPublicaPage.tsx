
import React, { useEffect } from 'react';
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

const CitaPublicaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { negocio, servicios, isLoading: isLoadingNegocio } = useNegocio(slug);
  
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
    handleMonthChange
  } = useDisponibilidad(negocio?.id, formData.servicio_id, formData.fecha);

  // Debug logs - very useful for monitoring the state
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

  if (isLoadingNegocio && !negocio) {
    return <LoadingIndicator message="Cargando información del negocio..." />;
  }

  if (!negocio) {
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

  // Get the selected service for displaying service duration
  const selectedService = servicios.find(s => s.id === formData.servicio_id);

  return (
    <>
      <StepsContainer 
        title={negocio.nombre} 
        currentStep={step}
        onVerificarClick={() => setVerificarDialogOpen(true)}
      >
        {step === 1 && (
          <ServiceSelector 
            servicios={servicios}
            selectedServiceId={formData.servicio_id}
            onServiceChange={handleServicioChange}
            onNext={handleNext}
          />
        )}

        {step === 2 && (
          <DateTimePicker 
            date={formData.fecha}
            selectedTime={formData.hora_inicio}
            diasSeleccionablesMes={diasSeleccionablesMes}
            horasDisponibles={horasDisponibles}
            cargandoHorarios={cargandoHorarios}
            duracionServicio={selectedService?.duracion_minutos || 30}
            onDateChange={handleFechaChange}
            onTimeChange={handleHoraChange}
            onMonthChange={handleMonthChange}
            onNext={handleNext}
            onBack={handleBack}
          />
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
    </>
  );
};

export default CitaPublicaPage;
