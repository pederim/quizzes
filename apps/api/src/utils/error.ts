import { ZodError } from 'zod';
import type { Logger } from 'pino';
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(logger: Logger) {
  return (err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ ok: false, error: err.flatten() });
    }
    const status = err?.status || 500;
    const msg = err?.message || 'Internal Error';
    if (status >= 500) logger.error(err);
    res.status(status).json({ ok: false, error: msg });
  };
}

export function httpError(status: number, message: string) {
  const e: any = new Error(message);
  e.status = status;
  return e;
}
