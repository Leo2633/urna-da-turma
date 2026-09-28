import confetti from 'canvas-confetti'
import { tema } from '@/theme/theme'

function reduzMovimento() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function confeteCurto() {
  if (reduzMovimento()) return
  void confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: tema.confete, disableForReducedMotion: true })
}

export function confeteGrande() {
  if (reduzMovimento()) return
  const fim = Date.now() + 2500
  const solta = () => {
    void confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: tema.confete, disableForReducedMotion: true })
    void confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: tema.confete, disableForReducedMotion: true })
    if (Date.now() < fim) requestAnimationFrame(solta)
  }
  solta()
}
