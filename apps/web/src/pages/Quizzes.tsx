import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Quizzes({ onView, onEdit, onNew }: { onView: (id:number)=>void, onEdit:(id:number)=>void, onNew:()=>void }) {
  const [items, setItems] = useState<any[]>([])
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    try {
      const res = await api.quizzes.list()
      setItems(res.data)
    } catch (e: any) { setErr(e.message) }
  }

  useEffect(() => { load() }, [])

  async function remove(id: number) {
    if (!confirm('Excluir quiz?')) return
    try { await api.quizzes.remove(id); load() } catch (e:any) { setErr(e.message) }
  }

  async function togglePublish(id: number) {
    try { await api.quizzes.publish(id); load() } catch (e:any) { setErr(e.message) }
  }

  return (
    <div className="card">
      <h2>Quizzes</h2>
      {err && <div className="err" style={{ marginBottom: 8 }}>{err}</div>}
      <button className="btn" onClick={onNew}>Novo Quiz</button>
      <table className="table" style={{ marginTop: 8 }}>
        <thead><tr><th>ID</th><th>Título</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {items.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{q.titulo}</td>
              <td><span className="badge">{q.status}</span></td>
              <td>
                <div style={{ display:'flex', gap: 6 }}>
                  <button className="btn ghost" onClick={() => onView(q.id)}>Ver</button>
                  <button className="btn ghost" onClick={() => onEdit(q.id)}>Editar</button>
                  <button className="btn secondary" onClick={() => togglePublish(q.id)}>{q.status === 'PUBLICADO' ? 'Despublicar' : 'Publicar'}</button>
                  <button className="btn ghost" onClick={() => remove(q.id)}>Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
