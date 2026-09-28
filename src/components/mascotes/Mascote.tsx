import type { Mascote as MascoteId } from '@/core/tipos'

export const NOMES_MASCOTES: Record<MascoteId, string> = {
  tucano: 'Tucano',
  jacare: 'Jacaré',
  guara: 'Guará',
  boto: 'Boto',
  peixe_boi: 'Peixe-boi',
  arara: 'Arara',
  onca: 'Onça',
  tartaruga: 'Tartaruga',
}

interface Props {
  id: MascoteId
  className?: string
  /** Texto alternativo. Por padrão usa o nome do mascote. */
  titulo?: string
}

/** Ilustrações flat próprias (SVG inline). Todas em viewBox 0 0 100 100. */
export function Mascote({ id, className = 'w-24 h-24', titulo }: Props) {
  const nome = titulo ?? NOMES_MASCOTES[id]
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={nome} xmlns="http://www.w3.org/2000/svg">
      <title>{nome}</title>
      {DESENHOS[id]}
    </svg>
  )
}

const olho = (cx: number, cy: number, r = 5) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#fff" />
    <circle cx={cx + r * 0.25} cy={cy} r={r * 0.5} fill="#1E1B4B" />
    <circle cx={cx + r * 0.4} cy={cy - r * 0.3} r={r * 0.18} fill="#fff" />
  </g>
)

const DESENHOS: Record<MascoteId, React.ReactNode> = {
  tucano: (
    <g>
      <ellipse cx="46" cy="60" rx="26" ry="30" fill="#1E1B4B" />
      <ellipse cx="46" cy="66" rx="14" ry="18" fill="#FFF7E6" />
      <path d="M58 40 C 75 30, 95 38, 96 52 C 90 58, 72 58, 58 52 Z" fill="#FF7A1A" />
      <path d="M58 46 C 72 48, 86 50, 96 52 C 90 58, 72 58, 58 52 Z" fill="#FFD23F" />
      <circle cx="52" cy="42" r="9" fill="#5B3DF5" />
      {olho(52, 42, 5)}
      <path d="M30 88 l6 -8 M40 90 l4 -9" stroke="#FF7A1A" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  jacare: (
    <g>
      <path d="M8 62 C 8 48, 30 44, 50 46 C 70 44, 92 48, 94 60 C 92 70, 70 74, 50 72 C 30 74, 8 72, 8 62 Z" fill="#22C55E" />
      <path d="M12 62 C 20 58, 40 58, 60 60 C 75 60, 88 62, 92 62 C 88 68, 70 70, 50 70 C 30 70, 14 68, 12 62 Z" fill="#A7F3D0" />
      <path d="M22 60 l3 -5 l3 5 M32 60 l3 -5 l3 5 M42 61 l3 -5 l3 5" fill="#fff" />
      <circle cx="72" cy="44" r="8" fill="#22C55E" />
      <circle cx="58" cy="42" r="8" fill="#22C55E" />
      {olho(72, 44, 4)}
      {olho(58, 42, 4)}
      <path d="M20 46 l-4 -8 M34 44 l-2 -9 M48 44 l0 -9" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  guara: (
    <g>
      <ellipse cx="50" cy="55" rx="22" ry="20" fill="#F43F8E" />
      <circle cx="62" cy="36" r="12" fill="#F43F8E" />
      <path d="M72 38 C 82 44, 88 56, 84 66" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none" />
      {olho(64, 34, 4)}
      <path d="M40 74 l-2 18 M56 74 l2 18" stroke="#F43F8E" strokeWidth="5" strokeLinecap="round" />
      <path d="M36 52 C 30 44, 30 36, 38 34" stroke="#FFD23F" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  ),
  boto: (
    <g>
      <path d="M14 58 C 20 38, 52 32, 74 44 C 84 50, 90 54, 96 48 C 92 60, 84 62, 76 60 C 60 72, 28 72, 14 58 Z" fill="#F9A8D4" />
      <path d="M40 40 C 46 30, 56 30, 58 40 Z" fill="#F472B6" />
      <path d="M20 60 C 32 66, 60 66, 74 58" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" fill="none" />
      {olho(64, 48, 4)}
      <path d="M78 56 C 82 50, 88 50, 90 56" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="30" r="3" fill="#06B6D4" />
      <circle cx="22" cy="24" r="2" fill="#06B6D4" />
    </g>
  ),
  peixe_boi: (
    <g>
      <ellipse cx="50" cy="56" rx="34" ry="22" fill="#94A3B8" />
      <ellipse cx="50" cy="62" rx="24" ry="12" fill="#CBD5E1" />
      <path d="M84 56 C 94 48, 96 64, 84 62 Z" fill="#94A3B8" />
      <path d="M28 70 C 24 80, 34 82, 36 74 M62 70 C 66 80, 56 82, 54 74" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" fill="none" />
      {olho(30, 50, 4)}
      <circle cx="18" cy="56" r="2.5" fill="#1E1B4B" />
      <path d="M18 62 C 22 64, 26 64, 28 62" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  arara: (
    <g>
      <path d="M40 70 C 30 60, 32 40, 48 34 C 62 30, 74 40, 72 56 C 70 72, 54 80, 40 70 Z" fill="#2563EB" />
      <path d="M46 70 C 40 60, 44 44, 56 40 C 66 38, 70 48, 66 60 C 62 72, 52 78, 46 70 Z" fill="#FFD23F" />
      <path d="M56 40 C 62 26, 74 26, 78 36 C 74 36, 68 36, 62 40 Z" fill="#EF4444" />
      <circle cx="62" cy="30" r="10" fill="#EF4444" />
      <path d="M70 30 C 82 30, 84 40, 76 44 C 74 38, 70 34, 70 30 Z" fill="#1E1B4B" />
      {olho(64, 28, 4)}
      <path d="M36 74 C 24 84, 20 92, 18 96" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
  onca: (
    <g>
      <circle cx="50" cy="54" r="28" fill="#FFD23F" />
      <circle cx="28" cy="34" r="9" fill="#FFD23F" />
      <circle cx="72" cy="34" r="9" fill="#FFD23F" />
      <circle cx="28" cy="34" r="4" fill="#FF7A1A" />
      <circle cx="72" cy="34" r="4" fill="#FF7A1A" />
      <circle cx="26" cy="56" r="4" fill="#1E1B4B" />
      <circle cx="74" cy="60" r="4" fill="#1E1B4B" />
      <circle cx="38" cy="76" r="3" fill="#1E1B4B" />
      <circle cx="64" cy="76" r="3" fill="#1E1B4B" />
      {olho(40, 50, 5)}
      {olho(60, 50, 5)}
      <path d="M46 62 l4 4 l4 -4 Z" fill="#F43F8E" />
      <path d="M50 66 C 46 72, 40 70, 40 68 M50 66 C 54 72, 60 70, 60 68" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  tartaruga: (
    <g>
      <ellipse cx="50" cy="56" rx="30" ry="22" fill="#16A34A" />
      <path d="M32 46 l10 -8 l14 0 l10 8 l-4 14 l-26 0 Z" fill="#4ADE80" />
      <path d="M42 38 l-10 8 M56 38 l10 8 M62 60 l-4 -14 M38 60 l-6 -14" stroke="#16A34A" strokeWidth="3" />
      <circle cx="84" cy="52" r="10" fill="#86EFAC" />
      {olho(86, 50, 4)}
      <path d="M26 74 l-4 10 M42 78 l0 10 M60 78 l0 10 M74 74 l4 10" stroke="#86EFAC" strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
}
