import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'PROFESSOR', 'ALUNO']),
  cpf: z.string().optional(),
  phone: z.string().optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'PROFESSOR', 'ALUNO']).optional(),
  cpf: z.string().optional(),
  phone: z.string().optional()
});
