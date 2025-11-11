import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre es requerido.' }),
  tipo_documento: z.coerce.number(),
  ndocumento: z
    .string()
    .min(8, { message: 'El número de documento debe tener al menos 8 dígitos.' }),
  telefono: z.string().min(9, { message: 'El teléfono debe tener al menos 9 dígitos.' }),
  correo: z.string().email({ message: 'Por favor, ingresa un correo válido.' }),
  contraseña: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
});

export const loginSchema = z.object({
  correo: z.string().email(),
  contraseña: z.string().min(1),
});
