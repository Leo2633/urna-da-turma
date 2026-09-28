import { useEleicao } from '@/store/useEleicao'
import { tema } from '@/theme/theme'

/**
 * Placeholders de logo. Fonte: dados/config.json (logos) ou src/theme/theme.ts.
 * Nada é exibido quando os caminhos estão vazios.
 */
export function Logos({ className = '' }: { className?: string }) {
  const cfg = useEleicao((s) => s.dados?.config.logos)
  const principal = cfg?.principal || tema.logos.principal
  const secundario = cfg?.secundario || tema.logos.secundario
  if (!principal && !secundario) return null
  const base = import.meta.env.BASE_URL
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {principal && <img src={`${base}${principal}`} alt="Logotipo principal" className="h-10 w-auto object-contain md:h-14" />}
      {secundario && <img src={`${base}${secundario}`} alt="Logotipo secundário" className="h-10 w-auto object-contain md:h-14" />}
    </div>
  )
}
