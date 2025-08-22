import { z } from 'zod';

export const createQuestionSchema = z.object({
  quizId: z.number(),
  enunciado: z.string().min(2),
  tipo: z.enum(['MULTIPLA', 'VF', 'DISSERTATIVA']),
  opcoes: z.any().optional(),
  respostaCorreta: z.any().optional()
});

export const updateQuestionSchema = z.object({
  enunciado: z.string().min(2).optional(),
  tipo: z.enum(['MULTIPLA', 'VF', 'DISSERTATIVA']).optional(),
  opcoes: z.any().optional(),
  respostaCorreta: z.any().optional()
});
