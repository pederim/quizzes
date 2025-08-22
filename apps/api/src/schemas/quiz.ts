import { z } from 'zod';

export const createQuizSchema = z.object({
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  categoria: z.string().optional()
});

export const updateQuizSchema = z.object({
  titulo: z.string().min(2).optional(),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  status: z.enum(['RASCUNHO', 'PUBLICADO']).optional()
});
