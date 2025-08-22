import React, { useEffect, useState } from 'react'
import { api } from '../api'

type Tipo = 'MULTIPLA' | 'VF' | 'DISSERTATIVA'

export default function QuizEdit({ id, onDone }: { id: number | null, onDone: ()=>void }) {
  const isEdit = !!id
  const [form, setForm] = useState({ titulo: '', descricao: '', categoria: '' })
  const [tipo, setTipo] = useState<Tipo>('MULTIPLA')
  const [options, setOptions] = useState<string[]>([''])
  const [correct, setCorrect] = useState<number>(0)
  const [vf, setVf] = useState<'true'|'false'>('true')
  const [dissertativa, setDissertativa] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      if (!id) return
      try {
        const res = await api.quizzes.get(id)
        setForm({ titulo: res.data.titulo || '', descricao: res.data.descricao || '', categoria: res.data.categoria || '' })
      } catch (e:any) { setErr(e.message) }
    })()
  }, [id])

  function addOption() { setOptions([...options, '']) }
  function removeOption(i: number) {
    const arr = options.slice()
    arr.splice(i,1)
    setOptions(arr)
    if (correct >= arr.length) setCorrect(Math.max(0, arr.length-1))
  }

  async function save() {
    setErr(null); setOk(null)
    try {
      if (!form.titulo) { setErr('Informe o título do quiz.'); return }
      if (isEdit) {
        await api.quizzes.update(id!, form)
        setOk('Quiz atualizado.')
      } else {
        const created = await api.quizzes.create(form)
        // Se já tiver uma questão configurada, cria a questão opcionalmente:
        if (tipo === 'MULTIPLA' && options.filter(Boolean).length >= 2) {
          await api.questions.create({
            quizId: created.data.id,
            enunciado: 'Nova questão (edite depois)',
            tipo: 'MULTIPLA',
            opcoes: { valores: options },
            respostaCorreta: { valor: options[correct] }
          })
        } else if (tipo === 'VF') {
          await api.questions.create({
            quizId: created.data.id,
            enunciado: 'Afirmativa de exemplo (edite depois)',
            tipo: 'VF',
            respostaCorreta: { valor: vf === 'true' }
          })
        } else if (tipo === 'DISSERTATIVA' && dissertativa.trim()) {
          await api.questions.create({
            quizId: created.data.id,
            enunciado: 'Pergunta dissertativa (edite depois)',
            tipo: 'DISSERTATIVA',
            respostaCorreta: { texto: dissertativa }
          })
        }
        setOk('Quiz criado.')
      }
      onDone()
    } catch (e:any) { setErr(e.message) }
  }

  return (
    <div className="card">
      <h2>{isEdit ? 'Editar Quiz' : 'Novo Quiz'}</h2>
      {err && <div className="err" style={{ marginBottom: 8 }}>{err}</div>}
      {ok && <div className="success" style={{ marginBottom: 8 }}>{ok}</div>}

      <div className="row">
        <div className="col">
          <div className="label">Título</div>
          <input className="input" placeholder="Título" value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} />
        </div>
        <div className="col">
          <div className="label">Categoria</div>
          <input className="input" placeholder="Categoria" value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="label">Descrição</div>
          <input className="input" placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} />
        </div>
      </div>

      {!isEdit && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="sectionTitle"><strong>Adicionar 1ª questão (opcional)</strong></div>
          <div className="row">
            <div className="col">
              <div className="label">Tipo</div>
              <select className="select" value={tipo} onChange={e=>setTipo(e.target.value as Tipo)}>
                <option value="MULTIPLA">Múltipla escolha</option>
                <option value="VF">Verdadeiro/Falso</option>
                <option value="DISSERTATIVA">Dissertativa</option>
              </select>
            </div>
          </div>

          {tipo === 'MULTIPLA' && (
            <div style={{ marginTop: 8 }}>
              <div className="label">Opções</div>
              {options.map((opt, i) => (
                <div className="optionRow" key={i}>
                  <input type="radio" name="correct" checked={i===correct} onChange={()=>setCorrect(i)} />
                  <input className="input" placeholder={`Opção ${i+1}`} value={opt} onChange={e=>{
                    const arr = options.slice(); arr[i] = e.target.value; setOptions(arr)
                  }} />
                  <button className="btn ghost" onClick={()=>removeOption(i)}>Remover</button>
                </div>
              ))}
              <button className="btn secondary" onClick={addOption}>+ Adicionar opção</button>
            </div>
          )}

          {tipo === 'VF' && (
            <div className="row" style={{ marginTop: 8 }}>
              <label className="optionRow"><input type="radio" checked={vf==='true'} onChange={()=>setVf('true')} />Verdadeiro</label>
              <label className="optionRow"><input type="radio" checked={vf==='false'} onChange={()=>setVf('false')} />Falso</label>
            </div>
          )}

          {tipo === 'DISSERTATIVA' && (
            <div style={{ marginTop: 8 }}>
              <div className="label">Resposta esperada (opcional)</div>
              <textarea className="textarea" rows={3} value={dissertativa} onChange={e=>setDissertativa(e.target.value)} />
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display:'flex', gap: 8 }}>
        <button className="btn" onClick={save}>{isEdit ? 'Salvar' : 'Criar'}</button>
        <button className="btn ghost" onClick={onDone}>Cancelar</button>
      </div>
    </div>
  )
}
