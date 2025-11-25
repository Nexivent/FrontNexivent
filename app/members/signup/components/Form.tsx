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

const DocumentTypeNotice: React.FC = () => {
  return (
    <div className='mb-6 mx-auto max-w-2xl'>
      <div className='p-4 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 border-l-4 border-yellow-400 rounded-lg backdrop-blur-sm'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold'>
            ℹ
          </div>
          <div className='flex-1'>
            <h3 className='font-bold text-white mb-2 text-base'>Importante: Tipo de Documento</h3>
            <ul className='text-gray-300 space-y-1.5 text-xs'>
              <li className='flex items-start gap-2'>
                <span className='text-yellow-400 font-bold'>•</span>
                <span>
                  <strong className='text-yellow-400'>DNI y CE:</strong> Documentos para{' '}
                  <strong className='text-white'>CLIENTES</strong>
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-yellow-400 font-bold'>•</span>
                <span>
                  <strong className='text-yellow-400'>RUC Personal o RUC Empresa:</strong>{' '}
                  Documentos para <strong className='text-white'>ORGANIZADORES</strong>
                </span>
              </li>
            </ul>
            <p className='text-xs text-gray-300 mt-2 pt-2 border-t border-gray-700'>
              Al seleccionar tu tipo de documento, estarás accediendo como{' '}
              <strong className='text-yellow-400'>CLIENTE</strong> o{' '}
              <strong className='text-yellow-400'>ORGANIZADOR</strong> según corresponda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const handleGoogleSuccess = () => {
    console.log('Registro con Google exitoso - omitiendo verificación');
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
      {currentStep === 'initial' && (
        <>
          <DocumentTypeNotice />
          <InitialStep onNext={handleInitialStepComplete} />
        </>
      )}
      {currentStep === 'completion' && (
        <CompletionStep
          prefilledData={prefilledData}
          onGoBack={handleBackToInitial}
          onGoogleSuccess={handleGoogleSuccess}
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
