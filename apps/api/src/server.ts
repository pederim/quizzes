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

  app.use(helmet());
  app.use(express.json());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/quizzes', quizzesRouter);
  app.use('/questions', questionsRouter);

  app.use(errorHandler(logger));
  return app;
}
