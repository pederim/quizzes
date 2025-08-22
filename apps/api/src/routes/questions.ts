import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole, ensureQuizOwnership } from '../middleware/auth.js';
import { createQuestionSchema, updateQuestionSchema } from '../schemas/question.js';

export const questionsRouter = Router();

questionsRouter.post('/', authenticate, requireRole('PROFESSOR', 'ADMIN'), async (req, res, next) => {
  try {
    const data = createQuestionSchema.parse(req.body);
    await ensureQuizOwnership(req, data.quizId);
    const q = await prisma.question.create({ data });
    res.status(201).json({ ok: true, data: q });
  } catch (e) { next(e); }
});

questionsRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const q = await prisma.question.findUnique({ where: { id }, include: { quiz: true } });
    if (!q) return next({ status: 404, message: 'Not found' });
    if (req.user!.role === 'PROFESSOR' && q.quiz.autorId !== req.user!.id) {
      return next({ status: 403, message: 'Forbidden' });
    }
    if (req.user!.role === 'ALUNO' && q.quiz.status !== 'PUBLICADO') {
      return next({ status: 403, message: 'Forbidden' });
    }
    res.json({ ok: true, data: q });
  } catch (e) { next(e); }
});

questionsRouter.put('/:id', authenticate, requireRole('PROFESSOR', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.question.findUnique({ where: { id }, include: { quiz: true } });
    if (!existing) return next({ status: 404, message: 'Not found' });
    await ensureQuizOwnership(req, existing.quizId);
    const data = updateQuestionSchema.parse(req.body);
    const q = await prisma.question.update({ where: { id }, data });
    res.json({ ok: true, data: q });
  } catch (e) { next(e); }
});

questionsRouter.delete('/:id', authenticate, requireRole('PROFESSOR', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.question.findUnique({ where: { id }, include: { quiz: true } });
    if (!existing) return next({ status: 404, message: 'Not found' });
    await ensureQuizOwnership(req, existing.quizId);
    await prisma.question.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
