import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  aberto: boolean
  titulo: string
  onFechar: () => void
  children: ReactNode
}

export function Modal({ aberto, titulo, onFechar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const fechandoProgramaticamente = useRef(false)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) {
      d.showModal()
      // Garante foco no primeiro campo (alguns navegadores focam o próprio <dialog>).
      const alvo = d.querySelector<HTMLElement>('input') ?? d.querySelector<HTMLElement>('button')
      alvo?.focus()
    }
    if (!aberto && d.open) {
      fechandoProgramaticamente.current = true
      d.close()
    }
  }, [aberto])

  const aoFechar = () => {
    if (fechandoProgramaticamente.current) {
      fechandoProgramaticamente.current = false
      return
    }
    onFechar()
  }

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && onFechar()}
      className="m-auto w-[min(92vw,36rem)] rounded-3xl border-4 border-tinta/10 bg-superficie p-0 text-tinta shadow-pop backdrop:bg-tinta/60 backdrop:backdrop-blur-sm"
      aria-labelledby="modal-titulo"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-titulo" className="text-2xl font-black">
            {titulo}
          </h2>
          <button type="button" onClick={onFechar} className="rounded-full px-3 text-2xl leading-none text-tinta-suave hover:bg-black/5" aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
