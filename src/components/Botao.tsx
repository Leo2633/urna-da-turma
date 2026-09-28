import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variante = 'primaria' | 'secundaria' | 'contorno' | 'sucesso' | 'perigo' | 'fantasma'
type Tamanho = 'sm' | 'md' | 'lg' | 'xl'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanho?: Tamanho
}

const VARIANTES: Record<Variante, string> = {
  primaria: 'bg-primaria text-white shadow-pop hover:bg-primaria-escura active:translate-y-1 active:shadow-none',
  secundaria: 'bg-secundaria text-tinta shadow-pop hover:brightness-95 active:translate-y-1 active:shadow-none',
  contorno: 'bg-superficie text-primaria border-4 border-primaria shadow-pop-sm hover:bg-fundo active:translate-y-0.5 active:shadow-none',
  sucesso: 'bg-sucesso text-white shadow-pop hover:brightness-95 active:translate-y-1 active:shadow-none',
  perigo: 'bg-perigo text-white shadow-pop hover:brightness-95 active:translate-y-1 active:shadow-none',
  fantasma: 'bg-transparent text-tinta hover:bg-black/5',
}

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'px-4 py-2 text-base rounded-xl',
  md: 'px-6 py-3 text-lg rounded-2xl',
  lg: 'px-8 py-4 text-xl rounded-2xl',
  xl: 'px-10 py-5 text-2xl md:text-3xl rounded-3xl',
}

export const Botao = forwardRef<HTMLButtonElement, Props>(function Botao(
  { variante = 'primaria', tamanho = 'md', className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-black tracking-wide transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...rest}
    />
  )
})
