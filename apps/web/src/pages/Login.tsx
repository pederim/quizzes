import React, { useState } from 'react'
import { api } from '../api'
import '../theme.css'

export default function Login({ onLogin }: { onLogin: (data: any) => void }) {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('Admin@123')
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    try {
      const data = await api.login(email, password)
      onLogin(data)
    } catch (e: any) {
      setErr(e.message)
    }
  }

  return (
    <div className="container" style={{ display:'grid', placeItems:'center', minHeight:'80vh' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <h1 style={{ marginTop: 0 }}>Entrar</h1>
        <form onSubmit={submit}>
          <div className="label">Email</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="label" style={{ marginTop: 8 }}>Senha</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
          <button className="btn" type="submit" style={{ marginTop: 12, width: '100%' }}>Entrar</button>
        </form>
        <p style={{ fontSize: 12, color: '#666', marginTop: 12 }}>Use os logins do seed no README.</p>
      </div>
    </div>
  )
}
