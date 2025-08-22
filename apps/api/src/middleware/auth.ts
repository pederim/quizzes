import type { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt.js';
import { prisma } from '../db.js';

export interface AuthUser {
  id: number;
  role: 'ADMIN' | 'PROFESSOR' | 'ALUNO';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Missing token' });
  }
  const token = auth.slice('Bearer '.length);
  try {
    const payload = verifyAccess<AuthUser>(token);
    req.user = payload;
    return next();
  } catch (e) {
    return next({ status: 401, message: 'Invalid token' });
  }
}

export function requireRole(...roles: AuthUser['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return next({ status: 403, message: 'Forbidden' });
    }
    return next();
  };
}

// Optional helper to ensure resource ownership for professors
export async function ensureQuizOwnership(req: Request, quizId: number) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw { status: 404, message: 'Quiz not found' };
  if (req.user?.role === 'PROFESSOR' && quiz.autorId !== req.user?.id) {
    throw { status: 403, message: 'Not owner of quiz' };
  }
  return quiz;
}
