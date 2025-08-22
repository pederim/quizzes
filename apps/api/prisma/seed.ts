import { PrismaClient, Role, QuizStatus, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const profPass = await bcrypt.hash('Prof@123', 10);
  const alunoPass = await bcrypt.hash('Aluno@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@demo.com',
      passwordHash: adminPass,
      role: Role.ADMIN
    }
  });

  const prof = await prisma.user.upsert({
    where: { email: 'prof@demo.com' },
    update: {},
    create: {
      name: 'Professor',
      email: 'prof@demo.com',
      passwordHash: profPass,
      role: Role.PROFESSOR
    }
  });

  const aluno = await prisma.user.upsert({
    where: { email: 'aluno@demo.com' },
    update: {},
    create: {
      name: 'Aluno',
      email: 'aluno@demo.com',
      passwordHash: alunoPass,
      role: Role.ALUNO
    }
  });

  const quiz = await prisma.quiz.create({
    data: {
      titulo: 'Noções Básicas de Lógica',
      descricao: 'Quiz introdutório',
      categoria: 'Lógica',
      status: QuizStatus.RASCUNHO,
      autorId: prof.id,
      questoes: {
        create: [
          {
            enunciado: '2 + 2 = ?',
            tipo: QuestionType.MULTIPLA,
            opcoes: { valores: ['3', '4', '5'] },
            respostaCorreta: { valor: '4' }
          },
          {
            enunciado: 'A Terra é plana.',
            tipo: QuestionType.VF,
            respostaCorreta: { valor: false }
          }
        ]
      }
    }
  });

  console.log('Seed complete:', { admin, prof, aluno, quiz: quiz.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
