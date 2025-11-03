import { z } from 'zod';


export const crearClienteEsquema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  
  email: z.string()
    .email('Debe ser un email válido')
    .max(100, 'El email no puede tener más de 100 caracteres'),
  
  telefono: z.string()
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(50, 'El teléfono no puede tener más de 50 caracteres'),
  
  documentoIdentidad: z.string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(50, 'El documento no puede tener más de 50 caracteres')
});


export const actualizarClienteEsquema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .optional(),
  
  email: z.string()
    .email('Debe ser un email válido')
    .max(100, 'El email no puede tener más de 100 caracteres')
    .optional(),
  
  telefono: z.string()
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(50, 'El teléfono no puede tener más de 50 caracteres')
    .optional(),
  
  documentoIdentidad: z.string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(50, 'El documento no puede tener más de 50 caracteres')
    .optional()
    
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe proporcionar al menos un campo para actualizar'
});