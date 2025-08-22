# Web Dockerfile (dev server for simplicity)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN npm i -g pnpm && pnpm install || true

FROM node:20-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
ENV VITE_API_URL=http://localhost:4000
CMD ["npm","run","dev","--","--host","0.0.0.0"]
