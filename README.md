# Quizzes Monorepo (Node + React + Postgres)

Monorepo simples com **API (Express + Prisma/PostgreSQL)** e **Web (React + Vite)**.
Inclui **JWT + RBAC**, **CRUD de Usuários, Quizzes e Questões**, e **seed de dados**.

## Requisitos
- Node 20+
- pnpm (ou npm/yarn, porém os comandos abaixo assumem pnpm)
- Docker + Docker Compose

## Execução com Docker (recomendado)
1. Copie `.env.example` para `.env` na pasta `apps/api` e ajuste as secrets se quiser.
2. Rode:
   ```bash
   docker compose up --build
   ```
3. A API sobe em `http://localhost:4000` e o Frontend em `http://localhost:5173`.

> O container da API aplica migrations e roda o **seed** automaticamente no primeiro start.

### Credenciais (seed)
- **Admin**: `admin@demo.com` / `Admin@123`
- **Professor**: `prof@demo.com` / `Prof@123`
- **Aluno**: `aluno@demo.com` / `Aluno@123`

## Execução local (sem Docker)
1. Crie um banco Postgres local e coloque a URL em `apps/api/.env` (veja `.env.example`).
2. Instale deps na raiz:
   ```bash
   pnpm i
   ```
3. Na API:
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   pnpm prisma db seed
   pnpm dev
   ```
   API em `http://localhost:4000`
4. No frontend:
   ```bash
   cd ../web
   pnpm dev
   ```
   Acesse `http://localhost:5173`

## Estrutura
```
quizzes-monorepo/
├─ apps/
│  ├─ api/     (Express + TS + Prisma/Postgres)
│  └─ web/     (React + Vite + TS)
├─ docker-compose.yml
├─ package.json
└─ pnpm-workspace.yaml
```

## Rotas principais (API)
- `GET /healthz`
- **Auth**: `POST /auth/register` (admin), `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- **Users (admin)**: `GET/POST /users`, `GET/PUT/DELETE /users/:id`
- **Quizzes**: `GET/POST /quizzes`, `GET/PUT/DELETE /quizzes/:id`, `POST /quizzes/:id/publish`
- **Questions**: `POST /questions`, `GET/PUT/DELETE /questions/:id`

RBAC: `ADMIN` gerencia usuários; `PROFESSOR` gerencia **seus** quizzes/questões; `ALUNO` lê quizzes **PUBLICADOS**.

> Projeto minimalista, focado em **rodar sem erros** e demonstrar os fluxos básicos.
