'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { registerSchema } from '@components/Form/validationSchemas';
import InitialStep from './InitialStep';
import CompletionStep from './CompletionStep';
import VerificationStep from './VerificationStep';

type RegisterFormData = z.infer<typeof registerSchema>;

export interface PrefilledData {
  nombre: string;
  tipo_documento: string;
  ndocumento: string;
}

const Form: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'initial' | 'completion' | 'verification'>(
    'initial'
  );
  const [prefilledData, setPrefilledData] = useState<PrefilledData>({
    nombre: '',
    tipo_documento: '',
    ndocumento: '',
  });
  const [verificationData, setVerificationData] = useState<{
    usuarioId: number;
    correo: string;
    nombre: string;
  } | null>(null);
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const handleInitialStepComplete = (data: PrefilledData) => {
    setPrefilledData(data);
    setCurrentStep('completion');
  };

  const handleBackToInitial = () => {
    setCurrentStep('initial');
  };

  const handleRegistrationComplete = (data: {
    usuarioId: number;
    correo: string;
    nombre: string;
  }) => {
    setVerificationData(data);
    setCurrentStep('verification');
  };

  return (
    <FormProvider {...methods}>
      {currentStep === 'initial' && <InitialStep onNext={handleInitialStepComplete} />}
      {currentStep === 'completion' && (
        <CompletionStep
          prefilledData={prefilledData}
          onGoBack={handleBackToInitial}
          onVerificationNeeded={handleRegistrationComplete}
        />
      )}
      {currentStep === 'verification' && verificationData && (
        <VerificationStep
          usuarioId={verificationData.usuarioId}
          correo={verificationData.correo}
          nombre={verificationData.nombre}
        />
      )}
    </FormProvider>
  );
};

export default Form;
