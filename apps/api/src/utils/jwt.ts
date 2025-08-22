import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_access';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh';

export function signAccess(payload: object, expiresIn = '15m') {
  return jwt.sign(payload as any, accessSecret, { expiresIn });
}

export function signRefresh(payload: object, expiresIn = '30d') {
  return jwt.sign(payload as any, refreshSecret, { expiresIn });
}

export function verifyAccess<T = any>(token: string): T {
  return jwt.verify(token, accessSecret) as T;
}

export function verifyRefresh<T = any>(token: string): T {
  return jwt.verify(token, refreshSecret) as T;
}
