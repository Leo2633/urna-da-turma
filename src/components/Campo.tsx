import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-2xl border-4 border-tinta/15 bg-superficie px-4 py-3 text-lg text-tinta placeholder:text-tinta-suave/60 focus:border-primaria focus:outline-none'

interface Base {
  rotulo: string
  ajuda?: ReactNode
  erro?: string | null
}

export function CampoTexto({ rotulo, ajuda, erro, className = '', ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block font-bold">{rotulo}</span>
      <input id={id} className={`${base} ${erro ? 'border-perigo' : ''} ${className}`} aria-invalid={!!erro} aria-describedby={erro ? `${id}-erro` : undefined} {...rest} />
      {ajuda && !erro && <span className="mt-1 block text-sm text-tinta-suave">{ajuda}</span>}
      {erro && (
        <span id={`${id}-erro`} role="alert" className="mt-1 block text-sm font-bold text-perigo">
          {erro}
        </span>
      )}
    </label>
  )
}

export function CampoArea({ rotulo, ajuda, erro, className = '', ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block font-bold">{rotulo}</span>
      <textarea id={id} className={`${base} ${erro ? 'border-perigo' : ''} ${className}`} aria-invalid={!!erro} {...rest} />
      {ajuda && !erro && <span className="mt-1 block text-sm text-tinta-suave">{ajuda}</span>}
      {erro && (
        <span role="alert" className="mt-1 block text-sm font-bold text-perigo">
          {erro}
        </span>
      )}
    </label>
  )
}

export function CampoSelect({ rotulo, ajuda, erro, className = '', children, ...rest }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block font-bold">{rotulo}</span>
      <select id={id} className={`${base} ${className}`} {...rest}>
        {children}
      </select>
      {ajuda && <span className="mt-1 block text-sm text-tinta-suave">{ajuda}</span>}
      {erro && <span role="alert" className="mt-1 block text-sm font-bold text-perigo">{erro}</span>}
    </label>
  )
}

export function Alternador({ rotulo, ajuda, marcado, onChange }: { rotulo: string; ajuda?: string; marcado: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={marcado}
        onClick={() => onChange(!marcado)}
        className={`relative mt-1 h-8 w-14 shrink-0 rounded-full border-4 transition-colors ${marcado ? 'bg-sucesso border-sucesso' : 'bg-tinta/20 border-tinta/20'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${marcado ? 'left-7' : 'left-0.5'}`} />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-bold">{rotulo}</span>
        {ajuda && <span className="block text-sm text-tinta-suave">{ajuda}</span>}
      </label>
    </div>
  )
}
