import { z } from 'zod';
import { DOCUMENTS_TYPES } from '@utils/Constants';

export const registerSchema = z
  .object({
    nombre: z.string().min(3, { message: 'El nombre es requerido.' }),
    tipo_documento: z.string().min(1, { message: 'Debes seleccionar un tipo de documento.' }),

    ndocumento: z.string().min(1, { message: 'El número de documento es requerido.' }),
    telefono: z.string().min(9, { message: 'El teléfono debe tener al menos 9 dígitos.' }),
    correo: z.string().email({ message: 'Por favor, ingresa un correo válido.' }),
    contraseña: z
      .string()
      .min(8, { message: 'Debe tener al menos 8 caracteres.' })
      .regex(/[A-Z]/, { message: 'Debe contener al menos una mayúscula.' })
      .regex(/[a-z]/, { message: 'Debe contener al menos una minúscula.' })
      .regex(/[0-9]/, { message: 'Debe contener al menos un número.' })
      .regex(/[^A-Za-z0-9]/, { message: 'Debe contener al menos un carácter especial.' }),
    confirmarContraseña: z.string().min(1, { message: 'Por favor, confirma tu contraseña.' }),
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
    }

    if (!isExact && docNumber.length > length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El ${label} no puede tener más de ${length} caracteres.`,
        path: ['ndocumento'],
      });
    }
  })
  .refine((data) => data.contraseña === data.confirmarContraseña, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmarContraseña'],
  });

export const loginSchema = z.object({
  correo: z.string().email(),
  contraseña: z.string().min(1),
});
