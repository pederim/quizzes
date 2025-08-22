import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { quizzesRouter } from './routes/quizzes.js';
import { questionsRouter } from './routes/questions.js';
import { errorHandler } from './utils/error.js';

const logger = pino({ name: 'api' });

export function createServer() {
  const app = express();

  // se estiver atrás de proxy (Koyeb/CF), habilita para cookies "secure"
  app.set('trust proxy', 1);

  // monta allowlist a partir da env CORS_ORIGIN (CSV)
  const ALLOW = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map(s => s.trim().replace(/\/$/, '')) // remove espaços e barra final
    .filter(Boolean);

  const corsMw = cors({
    origin(origin, cb) {
      // requisições sem Origin (curl/healthcheck) → libera
      if (!origin) return cb(null, true);
      const o = origin.replace(/\/$/, '');
      if (ALLOW.includes(o)) return cb(null, true);
      logger.warn({ origin: o }, 'CORS blocked origin');
      return cb(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  // Helmet ok; desativa CORP para não atrapalhar fetch cross-origin
  app.use(helmet({ crossOriginResourcePolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(express.json());

  // CORS deve vir ANTES das rotas
  app.use(corsMw);
  app.options('*', corsMw); // responde preflight para qualquer rota

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/quizzes', quizzesRouter);
  app.use('/questions', questionsRouter);

  app.use(errorHandler(logger));
  return app;
}
