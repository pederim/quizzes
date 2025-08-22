import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'

export default function QuizDetail({ id }: { id: number }) {
  const [quiz, setQuiz] = useState<any | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [qForm, setQForm] = useState({ enunciado: '', tipo: 'MULTIPLA', options: [''], correct: 0, vf: 'true', dissertativa: '' })
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, any>>({})

  async function load() {
    try {
      const res = await api.quizzes.get(id)
      setQuiz(res.data)
    } catch (e:any) { setErr(e.message) }
  }

  useEffect(() => { load() }, [id])

  function addOption() { setQForm({ ...qForm, options: [...qForm.options, ''] }) }
  function removeOption(i:number) {
    const arr = qForm.options.slice(); arr.splice(i,1)
    setQForm({ ...qForm, options: arr, correct: Math.min(qForm.correct, Math.max(0, arr.length-1)) })
  }

  async function addQuestion() {
    setErr(null)
    try {
      const payload: any = {
        quizId: id,
        enunciado: qForm.enunciado || 'Nova questão',
        tipo: qForm.tipo,
      }
      if (qForm.tipo === 'MULTIPLA') {
        const clean = qForm.options.map(s=>s.trim()).filter(Boolean)
        if (clean.length < 2) { setErr('Informe pelo menos 2 opções.'); return }
        payload.opcoes = { valores: clean }
        payload.respostaCorreta = { valor: clean[qForm.correct] ?? clean[0] }
      } else if (qForm.tipo === 'VF') {
        payload.respostaCorreta = { valor: qForm.vf === 'true' }
      } else {
        payload.respostaCorreta = { texto: qForm.dissertativa || '' }
      }
      await api.questions.create(payload)
      setQForm({ enunciado: '', tipo: 'MULTIPLA', options: [''], correct: 0, vf: 'true', dissertativa: '' })
      load()
    } catch (e:any) { setErr(e.message) }
  }

  function renderPreview(q:any) {
    if (q.tipo === 'MULTIPLA') {
      const opts: string[] = q.opcoes?.valores || []
      return (
        <div>
          {opts.map((opt, i) => (
            <label className="optionRow" key={i}>
              <input type="radio" name={`q${q.id}`} checked={previewAnswers[q.id]===opt} onChange={()=>setPreviewAnswers({ ...previewAnswers, [q.id]: opt })} />
              {opt}
            </label>
          ))}
        </div>
      )
    }
    if (q.tipo === 'VF') {
      return (
        <div>
          <label className="optionRow"><input type="radio" name={`q${q.id}`} checked={previewAnswers[q.id]===true} onChange={()=>setPreviewAnswers({ ...previewAnswers, [q.id]: true })} />Verdadeiro</label>
          <label className="optionRow"><input type="radio" name={`q${q.id}`} checked={previewAnswers[q.id]===false} onChange={()=>setPreviewAnswers({ ...previewAnswers, [q.id]: false })} />Falso</label>
        </div>
      )
    }
    return <textarea className="textarea" rows={3} placeholder="Digite sua resposta" onChange={e=>setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })} />
  }

  if (!quiz) return <p>Carregando...</p>

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{quiz.titulo} <span className="badge" style={{ marginLeft: 8 }}>{quiz.status}</span></h3>
      {err && <div className="err" style={{ marginBottom: 8 }}>{err}</div>}

      <h4 className="sectionTitle">Questões</h4>
      <div className="row">
        <div className="col" style={{ flex: '1 1 100%' }}>
          <ul style={{ listStyle:'none', padding: 0, margin: 0 }}>
            {quiz.questoes.map((q:any) => (
              <li key={q.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                  <strong>#{q.id}</strong> <div>{q.enunciado}</div>
                  <span className="badge">{q.tipo}</span>
                  <div style={{ marginLeft: 'auto' }}>
                    <button className="btn ghost" onClick={async()=>{ await api.questions.remove(q.id); load() }}>Excluir</button>
                  </div>
                </div>
                <div className="previewBlock">
                  <div className="label">Pré-visualização</div>
                  {renderPreview(q)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h4 className="sectionTitle">Adicionar nova questão</h4>
      <div className="card">
        <div className="row">
          <div className="col">
            <div className="label">Enunciado</div>
            <input className="input" placeholder="Enunciado" value={qForm.enunciado} onChange={e=>setQForm({...qForm, enunciado:e.target.value})} />
          </div>
          <div className="col">
            <div className="label">Tipo</div>
            <select className="select" value={qForm.tipo} onChange={e=>setQForm({...qForm, tipo:e.target.value})}>
              <option value="MULTIPLA">Múltipla</option>
              <option value="VF">Verdadeiro/Falso</option>
              <option value="DISSERTATIVA">Dissertativa</option>
            </select>
          </div>
        </div>

        {qForm.tipo === 'MULTIPLA' && (
          <div style={{ marginTop: 8 }}>
            <div className="label">Opções</div>
            {qForm.options.map((opt, i) => (
              <div className="optionRow" key={i}>
                <input type="radio" name="newCorrect" checked={i===qForm.correct} onChange={()=>setQForm({...qForm, correct:i})} />
                <input className="input" placeholder={`Opção ${i+1}`} value={opt} onChange={e=>{
                  const arr = qForm.options.slice(); arr[i] = e.target.value; setQForm({...qForm, options: arr})
                }} />
                <button className="btn ghost" onClick={()=>removeOption(i)}>Remover</button>
              </div>
            ))}
            <button className="btn secondary" onClick={addOption}>+ Adicionar opção</button>
          </div>
        )}

        {qForm.tipo === 'VF' && (
          <div className="row" style={{ marginTop: 8 }}>
            <label className="optionRow"><input type="radio" checked={qForm.vf==='true'} onChange={()=>setQForm({...qForm, vf:'true'})} />Verdadeiro</label>
            <label className="optionRow"><input type="radio" checked={qForm.vf==='false'} onChange={()=>setQForm({...qForm, vf:'false'})} />Falso</label>
          </div>
        )}

        {qForm.tipo === 'DISSERTATIVA' && (
          <div style={{ marginTop: 8 }}>
            <div className="label">Resposta esperada (opcional)</div>
            <textarea className="textarea" rows={3} value={qForm.dissertativa} onChange={e=>setQForm({...qForm, dissertativa:e.target.value})} />
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={addQuestion}>Adicionar</button>
        </div>
      </div>
    </div>
  )
}
