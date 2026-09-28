import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Botao } from '@/components/Botao'
import { Card } from '@/components/Card'
import { Moldura } from '@/components/Moldura'
import { Mascote } from '@/components/mascotes/Mascote'
import { CONQUISTAS, calcularNivel } from '@/core'
import { useEleicao } from '@/store/useEleicao'

export function SuaVez() {
  const e = useEleicao((s) => s.eleicao)!
  const t = useEleicao((s) => s.dados!.config.textos.suaVez)
  const abrirPainel = useEleicao((s) => s.abrirPainel)
  const [qr, setQr] = useState<string>('')

  useEffect(() => {
    QRCode.toString(t.url, { type: 'svg', margin: 1, width: 320, color: { dark: '#1E1B4B', light: '#FFFFFF' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [t.url])

  const n = calcularNivel(e.gamificacao.xp)

  return (
    <Moldura projetor titulo={t.titulo}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="space-y-5 bg-primaria text-white">
          <h2 className="titulo-projetor font-black">{t.titulo}</h2>
          <ul className="space-y-3 text-2xl md:text-3xl">
            {t.linhas.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden>👉</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 rounded-2xl bg-white/15 p-4">
            <Mascote id="tucano" className="h-24 w-24 shrink-0" />
            <p className="text-xl">Hoje foi treino. Na vida real, seu voto ajuda a decidir o rumo da cidade, do estado e do país.</p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="flex flex-col items-center text-center">
            <p className="text-2xl font-black">{t.chamada}</p>
            {qr ? <div className="mt-3 w-64 rounded-2xl border-4 border-tinta/10 bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} aria-label={`QR code para ${t.urlTexto}`} role="img" /> : <p className="text-tinta-suave">Não foi possível gerar o QR code.</p>}
            <a href={t.url} target="_blank" rel="noreferrer" className="mt-3 break-all text-lg font-black text-primaria underline">
              {t.urlTexto}
            </a>
            {t.observacao && <p className="mt-1 text-xs text-tinta-suave">{t.observacao}</p>}
          </Card>

          <Card>
            <p className="text-sm font-black uppercase tracking-widest text-secundaria">Resumo da turma</p>
            <p className="text-3xl font-black">
              Nível {n.nivel} · {n.titulo}
            </p>
            <p className="text-tinta-suave">{e.gamificacao.xp} XP acumulados</p>
            <ul className="mt-3 space-y-1">
              {e.gamificacao.conquistas.length === 0 && <li className="text-tinta-suave">Nenhuma conquista desta vez.</li>}
              {e.gamificacao.conquistas.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {CONQUISTAS[c].emoji}
                  </span>
                  <span className="font-bold">{CONQUISTAS[c].titulo}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Botao variante="contorno" tamanho="lg" onClick={() => abrirPainel(true)} className="w-full">
            Encerrar e preparar nova eleição
          </Botao>
        </div>
      </div>
    </Moldura>
  )
}
