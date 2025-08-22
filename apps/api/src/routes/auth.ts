import { Router } from 'express';
import { prisma } from '../db.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { loginSchema, registerSchema, refreshSchema } from '../schemas/auth.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return next({ status: 401, message: 'Credenciais inválidas' });
    const ok = await comparePassword(data.password, user.passwordHash);
    if (!ok) return next({ status: 401, message: 'Credenciais inválidas' });

    const accessToken = signAccess({ id: user.id, role: user.role, email: user.email });
    const rt = await prisma.refreshToken.create({ data: { userId: user.id } });
    const refreshToken = signRefresh({ tokenId: rt.id, userId: user.id });

    res.json({ ok: true, data: { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role, email: user.email } } });
  } catch (e) { next(e); }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const data = refreshSchema.parse(req.body);
    const payload = verifyRefresh<{ tokenId: string, userId: number }>(data.refreshToken);
    const token = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } });
    if (!token || token.revoked) return next({ status: 401, message: 'Refresh inválido' });

    const user = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!user) return next({ status: 401, message: 'Usuário inválido' });

    const accessToken = signAccess({ id: user.id, role: user.role, email: user.email });
    res.json({ ok: true, data: { accessToken } });
  } catch (e) { next(e); }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const data = refreshSchema.parse(req.body);
    const payload = verifyRefresh<{ tokenId: string }>(data.refreshToken);
    await prisma.refreshToken.update({ where: { id: payload.tokenId }, data: { revoked: true } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

authRouter.post('/register', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const hash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash: hash, role: data.role, cpf: data.cpf, phone: data.phone }
    });
    res.status(201).json({ ok: true, data: { id: user.id } });
  } catch (e) { next(e); }
});
