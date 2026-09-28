import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  // Se a chamada define o próprio fundo (bg-*), não aplica o padrão para evitar conflito de utilitários.
  const temFundo = /(^|\s)bg-/.test(className)
  return <div className={`${temFundo ? '' : 'bg-superficie'} rounded-3xl shadow-pop border-4 border-tinta/10 p-6 ${className}`} {...rest} />
}
