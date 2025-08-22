import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'PROFESSOR', 'ALUNO']),
  cpf: z.string().optional(),
  phone: z.string().optional()
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});
