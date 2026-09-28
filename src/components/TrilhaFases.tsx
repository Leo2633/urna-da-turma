import { FASES, INFO_FASES, indiceFase, type Fase } from '@/core'

interface Props {
  atual: Fase
  quizAtivo: boolean
  onIr?: (f: Fase) => void
  compacta?: boolean
}

/** Mapa de jogo: trilha de fases com a atual em destaque. */
export function TrilhaFases({ atual, quizAtivo, onIr, compacta }: Props) {
  const fases = FASES.filter((f) => f !== 'quiz' || quizAtivo)
  const idxAtual = indiceFase(atual)
  return (
    <ol className={`flex ${compacta ? 'gap-1' : 'flex-col gap-0'}`} aria-label="Trilha das fases">
      {fases.map((f, i) => {
        const info = INFO_FASES[f]
        const idx = indiceFase(f)
        const estado = idx < idxAtual ? 'feita' : idx === idxAtual ? 'atual' : 'futura'
        const cor = estado === 'feita' ? 'bg-sucesso text-white' : estado === 'atual' ? 'bg-destaque text-tinta ring-4 ring-primaria' : 'bg-tinta/10 text-tinta-suave'
        if (compacta) {
          return (
            <li key={f} className="flex-1" aria-current={estado === 'atual' ? 'step' : undefined}>
              <div className={`h-3 rounded-full ${estado === 'feita' ? 'bg-sucesso' : estado === 'atual' ? 'bg-destaque' : 'bg-tinta/15'}`} title={info.titulo} />
            </li>
          )
        }
        return (
          <li key={f} className="relative flex items-stretch gap-3" aria-current={estado === 'atual' ? 'step' : undefined}>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onIr?.(f)}
                disabled={!onIr}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-black shadow-pop-sm transition-transform hover:scale-105 disabled:hover:scale-100 ${cor}`}
                aria-label={`${info.titulo}${estado === 'atual' ? ' (fase atual)' : ''}`}
              >
                {estado === 'feita' ? '✓' : i + 1}
              </button>
              {i < fases.length - 1 && <div className={`w-1.5 flex-1 ${estado === 'feita' ? 'bg-sucesso' : 'bg-tinta/15'}`} aria-hidden />}
            </div>
            <div className="pb-5 pt-2">
              <p className={`font-black leading-tight ${estado === 'atual' ? 'text-primaria' : ''}`}>
                {info.titulo}
                {info.opcional && <span className="ml-2 rounded-full bg-tinta/10 px-2 text-xs font-bold">opcional</span>}
              </p>
              <p className="text-sm text-tinta-suave">{info.descricao}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
