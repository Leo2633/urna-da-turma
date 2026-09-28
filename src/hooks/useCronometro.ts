import { useCallback, useEffect, useRef, useState } from 'react'

export function useCronometro(segundosIniciais: number, aoTerminar?: () => void, aoTique?: (restante: number) => void) {
  const [restante, setRestante] = useState(segundosIniciais)
  const [rodando, setRodando] = useState(false)
  const fim = useRef<(() => void) | undefined>(aoTerminar)
  const tique = useRef(aoTique)
  useEffect(() => {
    fim.current = aoTerminar
    tique.current = aoTique
  })

  useEffect(() => {
    if (!rodando) return
    const id = setInterval(() => {
      setRestante((r) => {
        const n = r - 1
        if (n <= 0) {
          clearInterval(id)
          setRodando(false)
          fim.current?.()
          return 0
        }
        tique.current?.(n)
        return n
      })
    }, 1000)
    return () => clearInterval(id)
  }, [rodando])

  const iniciar = useCallback(() => setRodando(true), [])
  const pausar = useCallback(() => setRodando(false), [])
  const reiniciar = useCallback(
    (s = segundosIniciais) => {
      setRodando(false)
      setRestante(s)
    },
    [segundosIniciais],
  )
  return { restante, rodando, iniciar, pausar, reiniciar }
}
