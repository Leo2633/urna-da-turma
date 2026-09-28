import type { Candidato } from '@/core/tipos'
import { tema } from '@/theme/theme'
import { Emblema } from './Emblema'
import { Icone } from './Icone'

interface Props {
  candidato: Candidato
  cargo?: string
  tamanho?: 'mini' | 'normal' | 'projetor'
  className?: string
}

/** O "santinho" digital: cartão colorido de campanha. */
export function Santinho({ candidato, cargo, tamanho = 'normal', className = '' }: Props) {
  const cor = tema.santinho[candidato.cor]
  const mini = tamanho === 'mini'
  const proj = tamanho === 'projetor'
  return (
    <article
      className={`relative overflow-hidden rounded-3xl shadow-pop ${mini ? 'p-3' : proj ? 'p-6 md:p-10' : 'p-6'} ${className}`}
      style={{ background: cor.bg, color: cor.fg }}
      aria-label={`Santinho de ${candidato.apelido}, número ${candidato.numero}`}
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15" aria-hidden />
      <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-black/10" aria-hidden />
      <div className={`relative flex ${mini ? 'items-center gap-3' : 'flex-col items-center gap-4 md:flex-row md:items-start md:gap-8'}`}>
        <div className={`shrink-0 rounded-full bg-white/25 ${mini ? 'p-1' : 'p-2'}`}>
          <Emblema id={candidato.mascote} className={mini ? 'h-14 w-14' : proj ? 'h-32 w-32 md:h-44 md:w-44 xl:h-56 xl:w-56' : 'h-28 w-28'} />
        </div>
        <div className="min-w-0 flex-1 text-center md:text-left">
          {cargo && !mini && <p className={`font-bold uppercase tracking-widest opacity-80 ${proj ? 'text-2xl' : 'text-sm'}`}>{cargo}</p>}
          <h3 className={`truncate font-black leading-tight ${mini ? 'text-xl' : proj ? 'text-5xl md:text-6xl xl:text-7xl' : 'text-4xl'}`}>{candidato.apelido}</h3>
          {candidato.slogan && <p className={`mt-1 font-semibold italic ${mini ? 'text-sm truncate' : proj ? 'text-2xl md:text-3xl' : 'text-lg'}`}>“{candidato.slogan}”</p>}
          {!mini && candidato.propostas.filter(Boolean).length > 0 && (
            <ul className={`mt-4 space-y-2 text-left ${proj ? 'text-xl md:text-2xl' : 'text-base'}`}>
              {candidato.propostas.filter(Boolean).map((p, i) => (
                <li key={i} className="flex gap-2">
                  <Icone nome="certo" className="mt-[0.2em] h-[1em] w-[1em]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className={`shrink-0 rounded-2xl bg-white font-black tabular-nums text-tinta shadow-pop-sm ${mini ? 'px-3 py-1 text-2xl' : proj ? 'px-6 py-3 text-6xl md:text-7xl' : 'px-5 py-2 text-5xl'}`}
          aria-label={`Número ${candidato.numero}`}
        >
          {candidato.numero}
        </div>
      </div>
    </article>
  )
}
