import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole, ensureQuizOwnership } from '../middleware/auth.js';
import { createQuizSchema, updateQuizSchema } from '../schemas/quiz.js';

export const quizzesRouter = Router();

quizzesRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id;
    if (role === 'ADMIN') {
      const list = await prisma.quiz.findMany({ orderBy: { id: 'asc' } });
      return res.json({ ok: true, data: list });
    }
    if (role === 'PROFESSOR') {
      const list = await prisma.quiz.findMany({ where: { autorId: userId }, orderBy: { id: 'asc' } });
      return res.json({ ok: true, data: list });
    }
    // ALUNO: vê apenas publicados
    const list = await prisma.quiz.findMany({ where: { status: 'PUBLICADO' }, orderBy: { id: 'asc' } });
    return res.json({ ok: true, data: list });
  } catch (e) { next(e); }
});

quizzesRouter.post('/', authenticate, requireRole('PROFESSOR', 'ADMIN'), async (req, res, next) => {
  try {
    const data = createQuizSchema.parse(req.body);
    const quiz = await prisma.quiz.create({
      data: { ...data, autorId: req.user!.id }
    });
    res.status(201).json({ ok: true, data: quiz });
  } catch (e) { next(e); }
});

quizzesRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questoes: true } });
    if (!quiz) return next({ status: 404, message: 'Not found' });
    if (req.user!.role === 'ALUNO' && quiz.status !== 'PUBLICADO') {
      return next({ status: 403, message: 'Forbidden' });
    }
    if (req.user!.role === 'PROFESSOR' && quiz.autorId !== req.user!.id) {
      return next({ status: 403, message: 'Forbidden' });
    }
    res.json({ ok: true, data: quiz });
  } catch (e) { next(e); }
});

quizzesRouter.put('/:id', authenticate, requireRole('PROFESSOR', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await ensureQuizOwnership(req, id);
    const data = updateQuizSchema.parse(req.body);
    const quiz = await prisma.quiz.update({ where: { id }, data });
    res.json({ ok: true, data: quiz });
  } catch (e) { next(e); }
});

quizzesRouter.delete('/:id', authenticate, requireRole('PROFESSOR', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await ensureQuizOwnership(req, id);
    await prisma.quiz.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

quizzesRouter.post('/:id/publish', authenticate, requireRole('PROFESSOR', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const quiz = await ensureQuizOwnership(req, id);
    const count = await prisma.question.count({ where: { quizId: id } });
    if (count < 1) return next({ status: 400, message: 'Necessário >= 1 questão para publicar' });
    const newStatus = quiz.status === 'PUBLICADO' ? 'RASCUNHO' : 'PUBLICADO';
    const updated = await prisma.quiz.update({ where: { id }, data: { status: newStatus } });
    res.json({ ok: true, data: updated });
  } catch (e) { next(e); }
});
