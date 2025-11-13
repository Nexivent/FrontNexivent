'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { registerSchema } from '@components/Form/validationSchemas';
import InitialStep from './InitialStep';
import CompletionStep from './CompletionStep';

type RegisterFormData = z.infer<typeof registerSchema>;

export interface PrefilledData {
  nombre: string;
  tipo_documento: string;
  ndocumento: string;
}

const Form: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'completion'>('initial');
  const [prefilledData, setPrefilledData] = useState<PrefilledData | null>(null);

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const handleValidationSuccess = (data: PrefilledData) => {
    setPrefilledData(data);
    setStep('completion');
  };

  const handleGoBack = () => {
    setStep('initial');
    setPrefilledData(null);
    methods.reset();
  };

  return (
    <FormProvider {...methods}>
      {step === 'initial' && <InitialStep onValidateSuccess={handleValidationSuccess} />}

      {step === 'completion' && prefilledData && (
        <CompletionStep prefilledData={prefilledData} onGoBack={handleGoBack} />
      )}
    </FormProvider>
  );
};

export default Form;
