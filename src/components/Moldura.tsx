import { Icone } from './Icone'
import type { ReactNode } from 'react'
import { HudTurma } from './HudTurma'
import { Logos } from './Logos'
import { TrilhaFases } from './TrilhaFases'
import { useEleicao } from '@/store/useEleicao'
import { INFO_FASES } from '@/core'

interface Props {
  children: ReactNode
  /** Modo projetor: esconde cabeçalho detalhado e aumenta tudo. */
  projetor?: boolean
  titulo?: string
}

/** Moldura padrão das telas: cabeçalho com logos, trilha compacta e HUD da turma. */
export function Moldura({ children, projetor = false, titulo }: Props) {
  const e = useEleicao((s) => s.eleicao)
  const nome = useEleicao((s) => s.dados?.config.app.nome ?? 'Urna da Turma')
  const rodape = useEleicao((s) => s.dados?.config.app.rodape)
  if (!e) return null
  const info = INFO_FASES[e.fase]
  return (
    <div className="fundo-pontilhado flex min-h-dvh flex-col">
      <header className={`nao-imprimir mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pt-4 ${projetor ? 'pb-1' : 'pb-2'}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaria text-white">
            <Icone nome="urna" className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-black uppercase tracking-widest text-secundaria">{nome}</p>
            <h1 className={`font-black ${projetor ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>{titulo ?? info.titulo}</h1>
          </div>
        </div>
        <Logos className="ml-2" />
        <div className="ml-auto w-full sm:w-80">
          <HudTurma compacto={projetor} />
        </div>
        <div className="w-full">
          <TrilhaFases atual={e.fase} quizAtivo={e.config.quizAtivo} compacta />
        </div>
      </header>
      <main className={`mx-auto w-full max-w-7xl flex-1 px-4 pb-24 ${projetor ? 'pt-2' : 'pt-4'}`}>{children}</main>
      {rodape && <footer className="nao-imprimir px-4 pb-20 text-center text-xs text-tinta-suave md:pb-4">{rodape}</footer>}
    </div>
  )
}
