import { Botao } from '@/components/Botao'
import { Card } from '@/components/Card'
import { Moldura } from '@/components/Moldura'
import { criarTurno, turnoCorrente, zeresima } from '@/core'
import { useEleicao } from '@/store/useEleicao'

export function Zeresima() {
  const e = useEleicao((s) => s.eleicao)!
  const textos = useEleicao((s) => s.dados!.config.textos.zeresima)
  const abrir = useEleicao((s) => s.abrirVotacao)
  const turno = turnoCorrente(e) ?? criarTurno(e.turnoAtual, e.candidatos)
  const r = zeresima(turno, e.candidatos, { maioriaAbsoluta: e.config.maioriaAbsoluta, eleitoresEsperados: e.config.eleitoresEsperados })
  const agora = new Date()

  return (
    <Moldura projetor titulo={e.turnoAtual === 2 ? 'Zerésima do 2º turno' : 'Zerésima'}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="space-y-3 bg-primaria text-white">
          <h2 className="text-3xl font-black md:text-4xl">{textos.titulo}</h2>
          <p className="text-xl md:text-2xl">{textos.explicacao}</p>
          <p className="text-white/80">Confira o relatório ao lado: todo mundo com zero. Só depois disso a urna abre.</p>
        </Card>

        <Card className="font-mono text-lg md:text-xl" aria-label="Relatório zerésima">
          <div className="border-b-4 border-dashed border-tinta/20 pb-3 text-center">
            <p className="text-2xl font-black tracking-widest">ZERÉSIMA</p>
            <p>Turma {e.config.turma} · {e.turnoAtual}º turno</p>
            <p>{e.config.cargo}</p>
            <p className="text-sm text-tinta-suave">
              {agora.toLocaleDateString('pt-BR')} {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <table className="mt-3 w-full">
            <tbody>
              {r.ranking.map((x) => (
                <tr key={x.candidato.id} className="border-b border-tinta/10">
                  <td className="py-1 tabular-nums">{x.candidato.numero}</td>
                  <td className="py-1">{x.candidato.apelido}</td>
                  <td className="py-1 text-right font-black tabular-nums">{x.votos}</td>
                </tr>
              ))}
              <tr className="border-b border-tinta/10">
                <td className="py-1" />
                <td className="py-1">Brancos</td>
                <td className="py-1 text-right font-black">{r.brancos}</td>
              </tr>
              <tr className="border-b border-tinta/10">
                <td className="py-1" />
                <td className="py-1">Nulos</td>
                <td className="py-1 text-right font-black">{r.nulos}</td>
              </tr>
              <tr>
                <td className="py-2" />
                <td className="py-2 font-black">TOTAL</td>
                <td className="py-2 text-right font-black">{r.total}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 border-t-4 border-dashed border-tinta/20 pt-3 text-center text-sm">Eleitores esperados: {e.config.eleitoresEsperados} · Comparecimento: 0</p>
        </Card>
      </div>
      <div className="mt-6 flex justify-center">
        <Botao tamanho="xl" variante="sucesso" onClick={abrir}>
          Conferido! Abrir a urna 🗳️
        </Botao>
      </div>
    </Moldura>
  )
}
