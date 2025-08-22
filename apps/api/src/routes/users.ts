import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createUserSchema, updateUserSchema } from '../schemas/user.js';
import { hashPassword } from '../utils/password.js';

export const usersRouter = Router();

usersRouter.use(authenticate, requireRole('ADMIN'));

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' }, select: { id: true, name: true, email: true, role: true } });
  res.json({ ok: true, data: users });
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, role: data.role, passwordHash, cpf: data.cpf, phone: data.phone }
    });
    res.status(201).json({ ok: true, data: { id: user.id } });
  } catch (e) { next(e); }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } });
    if (!user) return next({ status: 404, message: 'Not found' });
    res.json({ ok: true, data: user });
  } catch (e) { next(e); }
});

usersRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id }, data });
    res.json({ ok: true, data: { id: user.id } });
  } catch (e) { next(e); }
});

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
