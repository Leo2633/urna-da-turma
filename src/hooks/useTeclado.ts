import { useEffect } from 'react'

/** Escuta o teclado físico. Mapeia dígitos, Enter (confirma), Backspace/Delete (corrige), B (branco). */
export function useTecladoUrna(handlers: { digito: (d: string) => void; confirma: () => void; corrige: () => void; branco: () => void }, ativo = true) {
  useEffect(() => {
    if (!ativo) return
    const fn = (ev: KeyboardEvent) => {
      const alvo = ev.target as HTMLElement | null
      if (alvo && ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName)) return
      if (/^[0-9]$/.test(ev.key)) {
        ev.preventDefault()
        handlers.digito(ev.key)
      } else if (ev.key === 'Enter') {
        ev.preventDefault()
        handlers.confirma()
      } else if (ev.key === 'Backspace' || ev.key === 'Delete' || ev.key === 'Escape') {
        ev.preventDefault()
        handlers.corrige()
      } else if (ev.key.toLowerCase() === 'b') {
        ev.preventDefault()
        handlers.branco()
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [handlers, ativo])
}
