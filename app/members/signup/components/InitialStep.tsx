// app/members/signup/components/InitialStep.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DOCUMENTS_TYPES } from '@utils/Constants';
import api from '@utils/api';
import { type PrefilledData } from './Form';

// Componentes
import Select from '@components/Form/Select';
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';

const initialStepSchema = z
  .object({
    tipo_documento: z.string().min(1, { message: 'Debes seleccionar un tipo de documento.' }),
    ndocumento: z.string().min(1, { message: 'El número de documento es requerido.' }),
  })
  .superRefine((data, ctx) => {
    const selectedDocType = DOCUMENTS_TYPES.find((doc) => doc.value === data.tipo_documento);

    if (!selectedDocType) return;

    const { length, isExact, isNumeric, label } = selectedDocType;
    const docNumber = data.ndocumento;

    if (isNumeric && !/^\d+$/.test(docNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El ${label} solo puede contener números.`,
        path: ['ndocumento'],
      });
    }

    if (isExact && docNumber.length !== length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El ${label} debe tener exactamente ${length} dígitos.`,
        path: ['ndocumento'],
      });
    } else if (!isExact && docNumber.length > length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El ${label} no puede tener más de ${length} caracteres.`,
        path: ['ndocumento'],
      });
    }
  });

type InitialStepInputs = z.infer<typeof initialStepSchema>;

interface IProps {
  onValidateSuccess: (data: PrefilledData) => void;
}

const InitialStep: React.FC<IProps> = ({ onValidateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InitialStepInputs>({
    resolver: zodResolver(initialStepSchema),
    mode: 'onChange',
  });

  const watchedDocType = watch('tipo_documento');
  const docNumberMaxLength =
    DOCUMENTS_TYPES.find((doc) => doc.value === watchedDocType)?.length || 15;

  const onSubmit = async (data: InitialStepInputs) => {
    setLoading(true);
    setApiError(null);

    try {
      const endpoint = data.tipo_documento === '01' ? '/api/validate/dni' : '/api/validate/ruc';
      const response = await api.post(endpoint, { ndocumento: data.ndocumento });

      onValidateSuccess({
        nombre: response.data.nombreCompleto,
        tipo_documento: data.tipo_documento,
        ndocumento: data.ndocumento,
      });
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Error al validar el documento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='registration-step-container'>
      <form onSubmit={handleSubmit(onSubmit)} className='form shrink'>
        <div className='form-elements'>
          <div className='form-line' style={{ display: 'flex', gap: '1rem' }}>
            <Select
              label='Tipo de Documento'
              options={DOCUMENTS_TYPES}
              error={errors.tipo_documento?.message}
              {...register('tipo_documento')}
            />
            <Input
              label='N° de Documento'
              type='text'
              error={errors.ndocumento?.message}
              maxLength={docNumberMaxLength}
              {...register('ndocumento')}
            />
          </div>

          {apiError && <p className='form-error api-error'>{apiError}</p>}

          <div className='form-buttons'>
            <Button
              type='submit'
              color='yellow-filled'
              text='Validar Documento'
              disabled={loading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default InitialStep;
