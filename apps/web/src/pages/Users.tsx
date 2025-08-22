import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Users() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ALUNO' })
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function load() {
    try {
      const data = await api.users.list()
      setItems(data.data)
    } catch (e: any) { setErr(e.message) }
  }

  useEffect(() => { load() }, [])

  async function create() {
    setErr(null); setOk(null)
    try {
      if (!form.name || !form.email || !form.password) {
        setErr('Preencha nome, email e senha.')
        return
      }
      await api.users.create(form)
      setForm({ name: '', email: '', password: '', role: 'ALUNO' })
      setOk('Usuário criado com sucesso.')
      load()
    } catch (e: any) { setErr(e.message) }
  }

  async function remove(id: number) {
    if (!confirm('Excluir usuário?')) return
    setErr(null); setOk(null)
    try {
      await api.users.remove(id)
      setOk('Usuário excluído.')
      load()
    } catch (e: any) { setErr(e.message) }
  }

  return (
    <div className="card">
      <h2>Usuários (Admin)</h2>
      {err && <div className="err" style={{ marginBottom: 8 }}>{err}</div>}
      {ok && <div className="success" style={{ marginBottom: 8 }}>{ok}</div>}
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="col">
          <div className="label">Nome</div>
          <input className="input" placeholder="Nome" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        </div>
        <div className="col">
          <div className="label">Email</div>
          <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        </div>
        <div className="col">
          <div className="label">Senha</div>
          <input className="input" placeholder="Senha" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        </div>
        <div className="col">
          <div className="label">Papel</div>
          <select className="select" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="ADMIN">ADMIN</option>
            <option value="PROFESSOR">PROFESSOR</option>
            <option value="ALUNO">ALUNO</option>
          </select>
        </div>
        <div className="col" style={{ alignSelf: 'end' }}>
          <button className="btn" onClick={create}>Criar</button>
        </div>
      </div>

      <table className="table">
        <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Papel</th><th></th></tr></thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="badge">{u.role}</span></td>
              <td><button className="btn ghost" onClick={() => remove(u.id)}>Excluir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
