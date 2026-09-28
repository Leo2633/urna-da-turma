import { useState } from 'react'
import { Botao } from '@/components/Botao'
import { Card } from '@/components/Card'
import { Alternador, CampoSelect, CampoTexto } from '@/components/Campo'
import { Moldura } from '@/components/Moldura'
import { Mascote } from '@/components/mascotes/Mascote'
import { impedimentoParaAvancar } from '@/core'
import { useEleicao } from '@/store/useEleicao'

export function Configuracao() {
  const e = useEleicao((s) => s.eleicao)!
  const dados = useEleicao((s) => s.dados)!
  const atualizar = useEleicao((s) => s.atualizarConfig)
  const avancar = useEleicao((s) => s.avancarFase)
  const carregarFicticios = useEleicao((s) => s.carregarFicticios)
  const [cargoLivre, setCargoLivre] = useState(!dados.config.cargosSugeridos.includes(e.config.cargo))
  const [tentou, setTentou] = useState(false)
  const impedimento = impedimentoParaAvancar(e)

  const comecar = () => {
    setTentou(true)
    if (impedimento) return
    if (e.config.modoCandidatos === 'ficticios' && e.candidatos.length === 0) carregarFicticios(dados.ficticios)
    avancar()
  }

  return (
    <Moldura>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-5">
          <div>
            <h2 className="text-3xl font-black">Vamos montar a eleição da turma</h2>
            <p className="text-tinta-suave">Só o essencial. Dá para mudar depois no painel do mediador.</p>
          </div>

          <CampoTexto
            rotulo="Nome da turma"
            placeholder="Ex.: 2º ano B"
            value={e.config.turma}
            onChange={(ev) => atualizar({ turma: ev.target.value })}
            erro={tentou && !e.config.turma.trim() ? 'Dê um nome à turma.' : null}
            maxLength={40}
          />

          {!cargoLivre ? (
            <CampoSelect
              rotulo="Cargo em disputa"
              value={e.config.cargo}
              onChange={(ev) => {
                if (ev.target.value === '__livre') {
                  setCargoLivre(true)
                  atualizar({ cargo: '' })
                } else atualizar({ cargo: ev.target.value })
              }}
            >
              {dados.config.cargosSugeridos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__livre">Outro (escrever)…</option>
            </CampoSelect>
          ) : (
            <div className="space-y-1">
              <CampoTexto rotulo="Cargo em disputa" placeholder="Ex.: Guardião da Biblioteca" value={e.config.cargo} onChange={(ev) => atualizar({ cargo: ev.target.value })} maxLength={50} erro={tentou && !e.config.cargo.trim() ? 'Defina o cargo.' : null} />
              <button type="button" className="text-sm font-bold text-primaria underline" onClick={() => { setCargoLivre(false); atualizar({ cargo: dados.config.cargosSugeridos[0] ?? '' }) }}>
                Voltar às sugestões
              </button>
            </div>
          )}

          <CampoTexto
            rotulo="Quantos eleitores são esperados?"
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            value={e.config.eleitoresEsperados || ''}
            onChange={(ev) => atualizar({ eleitoresEsperados: Math.max(0, Number(ev.target.value)) })}
            ajuda="Usado na barra de comparecimento e na meta “100% da turma votou”."
            erro={tentou && e.config.eleitoresEsperados < 1 ? 'Informe um número maior que zero.' : null}
          />

          <fieldset className="space-y-3">
            <legend className="mb-1 font-bold">Quem serão os candidatos?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <OpcaoModo
                ativo={e.config.modoCandidatos === 'turma'}
                titulo="Alunos da turma"
                texto="Quem quiser se candidata com apelido, número e propostas."
                mascote="tucano"
                onClick={() => atualizar({ modoCandidatos: 'turma' })}
              />
              <OpcaoModo
                ativo={e.config.modoCandidatos === 'ficticios'}
                titulo="Personagens fictícios"
                texto={`${dados.ficticios.length} candidaturas prontas, com propostas para a escola. Ninguém fica exposto.`}
                mascote="arara"
                onClick={() => atualizar({ modoCandidatos: 'ficticios' })}
              />
            </div>
          </fieldset>

          <div className="space-y-3 rounded-2xl bg-fundo p-4">
            <Alternador rotulo="Exigir maioria absoluta" ajuda="Vence quem tiver mais de 50% dos votos válidos. Senão, segundo turno." marcado={e.config.maioriaAbsoluta} onChange={(v) => atualizar({ maioriaAbsoluta: v })} />
            <Alternador rotulo="Incluir o desafio Fato ou Fake" ajuda="Quiz rápido sobre eleições e desinformação." marcado={e.config.quizAtivo} onChange={(v) => atualizar({ quizAtivo: v })} />
            <Alternador rotulo="Mediador libera cada eleitor" ajuda="A urna só abre para o próximo depois de um toque seu." marcado={e.config.liberacaoPeloMediador} onChange={(v) => atualizar({ liberacaoPeloMediador: v })} />
            <CampoTexto rotulo="Tempo de discurso por candidatura (segundos)" type="number" min={15} max={600} value={e.config.tempoDiscursoSeg} onChange={(ev) => atualizar({ tempoDiscursoSeg: Math.max(15, Number(ev.target.value)) })} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Botao tamanho="lg" onClick={comecar}>
              Começar a eleição 🚀
            </Botao>
            {tentou && impedimento && <p className="font-bold text-perigo">{impedimento}</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-primaria text-white">
            <h3 className="text-2xl font-black">Como funciona</h3>
            <ol className="mt-3 space-y-2 text-lg">
              <li>1. Candidaturas se registram e ganham um santinho.</li>
              <li>2. Cada uma faz seu discurso no tempo combinado.</li>
              <li>3. Conferimos a zerésima e abrimos a urna.</li>
              <li>4. Apuração ao vivo, boletim e diploma.</li>
            </ol>
            <p className="mt-4 text-sm text-white/80">Tudo funciona sem internet e sem guardar nenhum dado pessoal.</p>
          </Card>
          <Card>
            <h3 className="font-black">Painel do mediador</h3>
            <p className="text-sm text-tinta-suave">Toque no cadeado no canto da tela e digite o PIN para avançar fases, liberar eleitores ou zerar tudo.</p>
          </Card>
        </div>
      </div>
    </Moldura>
  )
}

function OpcaoModo({ ativo, titulo, texto, mascote, onClick }: { ativo: boolean; titulo: string; texto: string; mascote: 'tucano' | 'arara'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      aria-label={`${titulo}: ${texto}`}
      className={`flex items-start gap-3 rounded-2xl border-4 p-3 text-left transition ${ativo ? 'border-primaria bg-primaria/10' : 'border-tinta/10 hover:border-tinta/30'}`}
    >
      <Mascote id={mascote} className="h-16 w-16 shrink-0" />
      <span>
        <span className="block font-black">{titulo}</span>
        <span className="block text-sm text-tinta-suave">{texto}</span>
      </span>
    </button>
  )
}
