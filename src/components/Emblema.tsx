import { normalizarSimbolo, type Simbolo } from '@/core/tipos'

export const NOMES_SIMBOLOS: Record<Simbolo, string> = {
  onda: 'Onda',
  raio: 'Raio',
  folha: 'Folha',
  ritmo: 'Ritmo',
  sol: 'Sol',
  vela: 'Vela',
  prisma: 'Prisma',
  orbita: 'Órbita',
}

interface Props {
  /** Aceita também os identificadores antigos, de eleições salvas antes da troca. */
  id: string
  className?: string
  /** Texto alternativo. Por padrão usa o nome do símbolo. */
  titulo?: string
}

const TINTA = '#12101F'

/** Símbolos de campanha no formato de bóton: marca gráfica sobre disco escuro. SVG próprio, viewBox 0 0 100 100. */
export function Emblema({ id, className = 'w-24 h-24', titulo }: Props) {
  const simbolo = normalizarSimbolo(id)
  const nome = titulo ?? NOMES_SIMBOLOS[simbolo]
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={nome} xmlns="http://www.w3.org/2000/svg">
      <title>{nome}</title>
      <circle cx="50" cy="50" r="48" fill={TINTA} />
      <circle cx="50" cy="50" r="42.5" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.5" />
      {MARCAS[simbolo]}
    </svg>
  )
}

const MARCAS: Record<Simbolo, React.ReactNode> = {
  onda: (
    <g fill="none" strokeWidth="7" strokeLinecap="round">
      <path d="M24 37 q6.5 -9 13 0 t13 0 t13 0 t13 0" stroke="#fff" />
      <path d="M24 52 q6.5 -9 13 0 t13 0 t13 0 t13 0" stroke="#14C8E0" />
      <path d="M24 67 q6.5 -9 13 0 t13 0 t13 0 t13 0" stroke="#14C8E0" strokeOpacity="0.55" />
    </g>
  ),
  raio: <path d="M57 14 L27 56 H46 L41 86 L73 42 H54 Z" fill="#C8F526" />,
  folha: (
    <g transform="rotate(35 50 50)">
      <path d="M50 86 C 24 68 24 34 50 14 C 76 34 76 68 50 86 Z" fill="#12B76A" />
      <path d="M50 28 V86 M50 46 L62 36 M50 60 L64 49 M50 53 L38 43 M50 67 L37 57" fill="none" stroke={TINTA} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  ritmo: (
    <g fill="#FF3D81">
      <rect x="21" y="42" width="8" height="16" rx="4" />
      <rect x="33.5" y="30" width="8" height="40" rx="4" />
      <rect x="46" y="20" width="8" height="60" rx="4" fill="#fff" />
      <rect x="58.5" y="34" width="8" height="32" rx="4" />
      <rect x="71" y="44" width="8" height="12" rx="4" />
    </g>
  ),
  sol: (
    <g>
      <path d="M30 58 A20 20 0 0 1 70 58 Z" fill="#FF6A13" />
      <path d="M50 22 V30 M24 34 L30 40 M76 34 L70 40 M14 58 H22 M78 58 H86" fill="none" stroke="#FF6A13" strokeWidth="5" strokeLinecap="round" />
      <path d="M26 68 H74 M36 78 H64" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  vela: (
    <g>
      <path d="M52 16 V64 H80 Z" fill="#fff" />
      <path d="M46 28 V64 H24 Z" fill="#14C8E0" />
      <path d="M20 72 H80 L72 82 H28 Z" fill="#14C8E0" />
    </g>
  ),
  prisma: (
    <g>
      <path d="M50 14 L80 42 L50 86 L20 42 Z" fill="#8B5CFF" />
      <path d="M50 14 L62 42 L50 86 L38 42 Z" fill="#fff" fillOpacity="0.85" />
      <path d="M20 42 H80" stroke={TINTA} strokeWidth="3" />
    </g>
  ),
  orbita: (
    <g>
      <ellipse cx="50" cy="50" rx="34" ry="13" transform="rotate(-30 50 50)" fill="none" stroke="#fff" strokeWidth="4.5" />
      <circle cx="50" cy="50" r="11" fill="#C8F526" />
      <circle cx="79.4" cy="33" r="5.5" fill="#FF3D81" />
    </g>
  ),
}
