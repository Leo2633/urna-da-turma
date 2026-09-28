export type NomeIcone =
  | 'urna'
  | 'cadeado'
  | 'cadeado-aberto'
  | 'lupa'
  | 'trofeu'
  | 'megafone'
  | 'escudo'
  | 'repetir'
  | 'seta-cima'
  | 'seta-direita'
  | 'sino'
  | 'impressora'
  | 'lapis'
  | 'lixeira'
  | 'certo'
  | 'errado'
  | 'pessoas'
  | 'mascara'
  | 'titulo'

interface Props {
  nome: NomeIcone
  className?: string
  /** Quando informado, o ícone é anunciado por leitores de tela. Sem ele, é decorativo. */
  rotulo?: string
}

/** Ícones de traço próprios. viewBox 0 0 24 24, cor herdada do texto. */
export function Icone({ nome, className = 'h-[1.2em] w-[1.2em]', rotulo }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={rotulo ? 'img' : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {TRACOS[nome]}
    </svg>
  )
}

const TRACOS: Record<NomeIcone, React.ReactNode> = {
  urna: (
    <>
      <path d="M4 12h16v8H4z" />
      <path d="M8 12V4h8v8" />
      <path d="M10.5 8h3" />
      <path d="M9 16h6" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </>
  ),
  'cadeado-aberto': (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.5-2" />
      <path d="M12 15v2" />
    </>
  ),
  lupa: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  trofeu: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" />
      <path d="M12 13v4M8.5 20h7M10 17h4" />
    </>
  ),
  megafone: (
    <>
      <path d="M4 10v4h3l8 4V6l-8 4z" />
      <path d="M8 14.5V19h3v-3" />
      <path d="M18.5 9.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  repetir: (
    <>
      <path d="M4 11a8 8 0 0 1 14-4l2 2" />
      <path d="M20 4v5h-5" />
      <path d="M20 13a8 8 0 0 1-14 4l-2-2" />
      <path d="M4 20v-5h5" />
    </>
  ),
  'seta-cima': <path d="M12 20V5M6 11l6-6 6 6" />,
  'seta-direita': <path d="M4 12h15M13 6l6 6-6 6" />,
  sino: (
    <>
      <path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z" />
      <path d="M10.5 21h3" />
    </>
  ),
  impressora: (
    <>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="8" rx="2" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  lapis: (
    <>
      <path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19z" />
      <path d="M13.5 7l3.5 3.5" />
    </>
  ),
  lixeira: (
    <>
      <path d="M4 7h16M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  certo: <path d="M5 12.5l4.5 4.5L19 7" />,
  errado: <path d="M6 6l12 12M18 6L6 18" />,
  pessoas: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.5c2 .8 3.5 2.8 3.5 5.5" />
    </>
  ),
  mascara: (
    <>
      <path d="M4 5h16v6c0 5-3.5 9-8 9s-8-4-8-9z" />
      <path d="M8 10h2M14 10h2" />
      <path d="M9 14.5c1.8 1.6 4.2 1.6 6 0" />
    </>
  ),
  titulo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16c.5-1.5 1.6-2.2 3-2.2s2.5.7 3 2.2" />
      <path d="M14 10h4M14 14h4" />
    </>
  ),
}
