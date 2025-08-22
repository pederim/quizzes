import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState<{ totalQuizzes: number; publicados: number; totalUsers?: number }>({
    totalQuizzes: 0,
    publicados: 0,
  })
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const quizzes = await api.quizzes.list()
        const list: any[] = quizzes.data || []
        const publicados = list.filter((q: any) => q.status === 'PUBLICADO').length
        const nextStats: any = { totalQuizzes: list.length, publicados }

        // Tenta pegar usuários (se for ADMIN). Se 403, ignora.
        try {
          const users = await api.users.list()
          nextStats.totalUsers = (users.data || []).length
        } catch {}

        setStats(nextStats)
      } catch (e:any) {
        setErr(e.message)
      }
    })()
  }, [])

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      {err && <div className="err" style={{ marginBottom: 8 }}>{err}</div>}

      <div className="row">
        <div className="col">
          <div className="card">
            <div className="label">Total de Quizzes</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalQuizzes}</div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="label">Publicados</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.publicados}</div>
          </div>
        </div>
        {typeof stats.totalUsers === 'number' && (
          <div className="col">
            <div className="card">
              <div className="label">Usuários</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalUsers}</div>
            </div>
          </div>
        )}
      </div>
      <p style={{ color: '#6b7a8c', marginTop: 12 }}>
        Dica: pressione <span className="kbd">Ctrl</span> + <span className="kbd">R</span> para atualizar os números.
      </p>
    </div>
  )
}
