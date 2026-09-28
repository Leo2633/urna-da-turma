import { useState } from 'react'
import { Botao } from '@/components/Botao'
import { Card } from '@/components/Card'
import { CampoTexto } from '@/components/Campo'
import { Moldura } from '@/components/Moldura'
import { Santinho } from '@/components/Santinho'
import { Emblema, NOMES_SIMBOLOS } from '@/components/Emblema'
import { Icone } from '@/components/Icone'
import { CORES_SANTINHO, SIMBOLOS, normalizarSimbolo, validarApelido, validarNumero, validarSlogan, type Candidato, type CorSantinho, type Simbolo } from '@/core'
import { tema } from '@/theme/theme'
import { useEleicao } from '@/store/useEleicao'
import { confeteCurto } from '@/components/confete'

const vazio = (): Omit<Candidato, 'id'> => ({ apelido: '', numero: '', slogan: '', propostas: ['', '', ''], mascote: SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)], cor: CORES_SANTINHO[Math.floor(Math.random() * CORES_SANTINHO.length)] })

export function Candidatura() {
  const e = useEleicao((s) => s.eleicao)!
  const dados = useEleicao((s) => s.dados)!
  const adicionar = useEleicao((s) => s.adicionarCandidato)
  const editar = useEleicao((s) => s.editarCandidato)
  const remover = useEleicao((s) => s.removerCandidato)
  const carregarFicticios = useEleicao((s) => s.carregarFicticios)
  const avancar = useEleicao((s) => s.avancarFase)
  const [form, setForm] = useState(vazio)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [tentou, setTentou] = useState(false)
  const [formAberto, setFormAberto] = useState(e.candidatos.length === 0)

  const maxSlogan = dados.config.regras.maxSlogan
  const erros = {
    apelido: validarApelido(form.apelido, e.candidatos, editandoId ?? undefined),
    numero: validarNumero(form.numero, e.candidatos, editandoId ?? undefined),
    slogan: validarSlogan(form.slogan),
  }
  const valido = !erros.apelido && !erros.numero && !erros.slogan

  const salvar = () => {
    setTentou(true)
    if (!valido) return
    const limpo = { ...form, apelido: form.apelido.trim(), slogan: form.slogan.trim(), propostas: form.propostas.map((p) => p.trim()).filter(Boolean) }
    if (editandoId) editar(editandoId, limpo)
    else {
      adicionar(limpo)
      confeteCurto()
    }
    setForm(vazio())
    setEditandoId(null)
    setTentou(false)
    setFormAberto(false)
  }

  const iniciarEdicao = (c: Candidato) => {
    setEditandoId(c.id)
    setForm({ ...c, propostas: [...c.propostas, '', '', ''].slice(0, 3) })
    setFormAberto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const preview: Candidato = { id: 'preview', ...form, apelido: form.apelido || 'Seu apelido', numero: form.numero.padStart(2, '·') || '··', propostas: form.propostas.filter(Boolean) }

  return (
    <Moldura>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {formAberto ? (
            <Card className="space-y-4">
              <h2 className="text-2xl font-black">{editandoId ? 'Editar candidatura' : 'Nova candidatura'}</h2>
              <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                <CampoTexto rotulo="Apelido" placeholder="Como a turma te chama?" value={form.apelido} onChange={(ev) => setForm({ ...form, apelido: ev.target.value })} maxLength={24} erro={tentou ? erros.apelido : null} ajuda="Só apelido. Nada de nome completo." />
                <CampoTexto rotulo="Número" placeholder="00" inputMode="numeric" value={form.numero} onChange={(ev) => setForm({ ...form, numero: ev.target.value.replace(/\D/g, '').slice(0, 2) })} maxLength={2} erro={tentou ? erros.numero : null} className="text-center text-3xl font-black tabular-nums" />
              </div>
              <CampoTexto rotulo={`Slogan (até ${maxSlogan} caracteres)`} placeholder="Uma frase que resume sua ideia" value={form.slogan} onChange={(ev) => setForm({ ...form, slogan: ev.target.value.slice(0, maxSlogan) })} maxLength={maxSlogan} erro={tentou ? erros.slogan : null} ajuda={`${form.slogan.length}/${maxSlogan}`} />
              <fieldset className="space-y-2">
                <legend className="font-bold">Até 3 propostas para a escola</legend>
                {form.propostas.map((p, i) => (
                  <CampoTexto key={i} rotulo={`Proposta ${i + 1}`} placeholder={['Ex.: cantinho de leitura', 'Ex.: torneio entre turmas', 'Ex.: mural de ideias'][i]} value={p} onChange={(ev) => setForm({ ...form, propostas: form.propostas.map((x, j) => (j === i ? ev.target.value.slice(0, 80) : x)) })} maxLength={80} />
                ))}
              </fieldset>
              <fieldset>
                <legend className="mb-2 font-bold">Símbolo da campanha</legend>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {SIMBOLOS.map((m: Simbolo) => (
                    <button key={m} type="button" onClick={() => setForm({ ...form, mascote: m })} aria-pressed={normalizarSimbolo(form.mascote) === m} aria-label={NOMES_SIMBOLOS[m]} title={NOMES_SIMBOLOS[m]} className={`rounded-2xl border-4 p-1 transition ${normalizarSimbolo(form.mascote) === m ? 'border-primaria bg-primaria/10' : 'border-transparent hover:border-tinta/20'}`}>
                      <Emblema id={m} className="h-14 w-14" />
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 font-bold">Cor do santinho</legend>
                <div className="flex flex-wrap gap-2">
                  {CORES_SANTINHO.map((c: CorSantinho) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, cor: c })} aria-pressed={form.cor === c} aria-label={c} className={`h-10 w-10 rounded-full border-4 ${form.cor === c ? 'border-tinta scale-110' : 'border-white'}`} style={{ background: tema.santinho[c].bg }} />
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                <Botao onClick={salvar}>{editandoId ? 'Salvar alterações' : 'Registrar candidatura'}</Botao>
                {(editandoId || e.candidatos.length > 0) && (
                  <Botao variante="fantasma" onClick={() => { setForm(vazio()); setEditandoId(null); setTentou(false); setFormAberto(false) }}>
                    Cancelar
                  </Botao>
                )}
              </div>
            </Card>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Botao onClick={() => setFormAberto(true)} tamanho="lg">
                + Nova candidatura
              </Botao>
              {e.config.modoCandidatos === 'ficticios' && (
                <Botao variante="contorno" tamanho="lg" onClick={() => carregarFicticios(dados.ficticios)}>
                  Recarregar personagens
                </Botao>
              )}
            </div>
          )}

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Candidaturas registradas</h2>
              <span className="rounded-full bg-primaria px-3 py-1 font-black text-white">{e.candidatos.length}</span>
            </div>
            {e.candidatos.length === 0 && <p className="text-tinta-suave">Ninguém ainda. Registre pelo menos 2 candidaturas para seguir.</p>}
            <ul className="space-y-2">
              {e.candidatos.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <Santinho candidato={c} tamanho="mini" className="flex-1" />
                  <div className="flex flex-col gap-1">
                    <Botao variante="fantasma" tamanho="sm" onClick={() => iniciarEdicao(c)} aria-label={`Editar ${c.apelido}`}>
                      <Icone nome="lapis" className="h-5 w-5" />
                    </Botao>
                    <Botao variante="fantasma" tamanho="sm" onClick={() => remover(c.id)} aria-label={`Remover ${c.apelido}`}>
                      <Icone nome="lixeira" className="h-5 w-5" />
                    </Botao>
                  </div>
                </li>
              ))}
            </ul>
            <Botao tamanho="lg" onClick={avancar} disabled={e.candidatos.length < 2} className="w-full">
              Ir para o horário eleitoral →
            </Botao>
          </Card>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-sm font-black uppercase tracking-widest text-tinta-suave">Prévia do santinho</p>
          <Santinho candidato={preview} cargo={e.config.cargo} />
        </div>
      </div>
    </Moldura>
  )
}
