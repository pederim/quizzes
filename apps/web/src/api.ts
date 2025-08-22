const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type Role = 'ADMIN' | 'PROFESSOR' | 'ALUNO';
export interface User {
  id: number; name: string; email: string; role: Role;
}

export function getToken() {
  return localStorage.getItem('accessToken');
}

export function setAuth(accessToken: string, refreshToken?: string, user?: User) {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function formatHttpError(data: any, status: number) {
  if (!data) return `HTTP ${status}`;
  if (typeof data === 'string') return data;
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error === 'object') return JSON.stringify(data.error);
  if (data.message) return data.message;
  return `HTTP ${status}`;
}

async function http(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    throw new Error(formatHttpError(data, res.status));
  }
  return data;
}

export const api = {
  login: (email: string, password: string) =>
    http('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  refresh: (refreshToken: string) =>
    http('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  me: (): User | null => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  },
  users: {
    list: () => http('/users'),
    create: (payload: any) => http('/users', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: number) => http(`/users/${id}`, { method: 'DELETE' })
  },
  quizzes: {
    list: () => http('/quizzes'),
    create: (payload: any) => http('/quizzes', { method: 'POST', body: JSON.stringify(payload) }),
    get: (id: number) => http(`/quizzes/${id}`),
    update: (id: number, payload: any) => http(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: number) => http(`/quizzes/${id}`, { method: 'DELETE' }),
    publish: (id: number) => http(`/quizzes/${id}/publish`, { method: 'POST' })
  },
  questions: {
    create: (payload: any) => http('/questions', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: number, payload: any) => http(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: number) => http(`/questions/${id}`, { method: 'DELETE' })
  }
};
