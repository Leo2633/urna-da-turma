import { useEffect } from 'react'
import { Botao } from '@/components/Botao'
import { Card } from '@/components/Card'
import { Moldura } from '@/components/Moldura'
import { Emblema } from '@/components/Emblema'
import { Icone } from '@/components/Icone'
import { apurar } from '@/core'
import { useEleicao } from '@/store/useEleicao'
import { confeteGrande } from '@/components/confete'

export function Boletim() {
  const e = useEleicao((s) => s.eleicao)!
  const nome = useEleicao((s) => s.dados!.config.app.nome)
  const avancar = useEleicao((s) => s.avancarFase)
  const opcoes = { maioriaAbsoluta: e.config.maioriaAbsoluta, eleitoresEsperados: e.config.eleitoresEsperados }
  const resultados = e.turnos.filter((t) => t.encerrado).map((t) => apurar(t, e.candidatos, opcoes))
  const ultimo = resultados[resultados.length - 1]
  const eleito = ultimo?.desfecho.tipo === 'eleito' ? ultimo.desfecho.candidato : null
  const data = new Date(e.criadaEm)

  useEffect(() => {
    if (eleito) confeteGrande()
  }, [eleito])

  return (
    <Moldura titulo="Boletim de urna e diplomação">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="font-mono text-base print:border-0 print:shadow-none" id="boletim">
          <div className="border-b-4 border-dashed border-tinta/20 pb-3 text-center">
            <p className="text-2xl font-black tracking-widest">BOLETIM DE URNA</p>
            <p className="font-bold">{nome}</p>
            <p>Turma {e.config.turma}</p>
            <p>{e.config.cargo}</p>
            <p className="text-sm text-tinta-suave">{data.toLocaleDateString('pt-BR')}</p>
          </div>
          {resultados.map((r) => (
            <div key={r.turno} className="mt-4">
              <p className="font-black">{r.turno}º TURNO</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-tinta/20 text-left text-xs uppercase text-tinta-suave">
                    <th className="py-1">Nº</th>
                    <th className="py-1">Candidatura</th>
                    <th className="py-1 text-right">Votos</th>
                    <th className="py-1 text-right">% válidos</th>
                  </tr>
                </thead>
                <tbody>
                  {r.ranking.map((x) => (
                    <tr key={x.candidato.id} className="border-b border-tinta/10">
                      <td className="py-1 tabular-nums">{x.candidato.numero}</td>
                      <td className="py-1">{x.candidato.apelido}</td>
                      <td className="py-1 text-right font-black tabular-nums">{x.votos}</td>
                      <td className="py-1 text-right tabular-nums">{x.percentualValidos}%</td>
                    </tr>
                  ))}
                  <tr className="border-b border-tinta/10">
                    <td />
                    <td className="py-1">Votos válidos</td>
                    <td className="py-1 text-right font-black">{r.validos}</td>
                    <td />
                  </tr>
                  <tr className="border-b border-tinta/10">
                    <td />
                    <td className="py-1">Brancos</td>
                    <td className="py-1 text-right font-black">{r.brancos}</td>
                    <td />
                  </tr>
                  <tr className="border-b border-tinta/10">
                    <td />
                    <td className="py-1">Nulos</td>
                    <td className="py-1 text-right font-black">{r.nulos}</td>
                    <td />
                  </tr>
                  <tr>
                    <td />
                    <td className="py-1 font-black">TOTAL</td>
                    <td className="py-1 text-right font-black">{r.total}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
              <p className="mt-1 text-sm">
                Comparecimento: {r.comparecimento}/{r.eleitoresEsperados} ({r.percentualComparecimento}%) · Abstenção: {r.percentualAbstencao}%
              </p>
              <p className="text-sm font-black">
                {r.desfecho.tipo === 'eleito' && `Resultado: ${r.desfecho.candidato.apelido} eleito(a).`}
                {r.desfecho.tipo === 'segundo_turno' && `Resultado: segundo turno (${r.desfecho.motivo === 'empate' ? 'empate' : 'sem maioria absoluta'}).`}
                {r.desfecho.tipo === 'empate_final' && 'Resultado: empate final.'}
                {r.desfecho.tipo === 'sem_votos' && 'Resultado: sem votos válidos.'}
              </p>
            </div>
          ))}
          <div className="mt-4 border-t-4 border-dashed border-tinta/20 pt-3 text-center text-xs text-tinta-suave">
            <p>Regra: {e.config.maioriaAbsoluta ? 'maioria absoluta dos válidos' : 'maioria simples'}.</p>
            <p>Simulação educativa. Voto secreto: nenhum registro individual é guardado.</p>
          </div>
          <div className="mt-4 flex gap-2 nao-imprimir">
            <Botao variante="contorno" onClick={() => window.print()}>
              <Icone nome="impressora" />
              Imprimir boletim
            </Botao>
          </div>
        </Card>

        <div className="space-y-4 nao-imprimir">
          {eleito ? (
            <Card className="relative overflow-hidden border-8 border-destaque bg-gradient-to-br from-superficie to-fundo text-center">
              <div className="absolute inset-3 rounded-2xl border-4 border-dashed border-primaria/30" aria-hidden />
              <div className="relative space-y-3 py-4">
                <p className="text-sm font-black uppercase tracking-[0.4em] text-secundaria">Diploma</p>
                <Emblema id={eleito.mascote} className="mx-auto h-36 w-36" />
                <p className="text-lg">A turma <strong>{e.config.turma}</strong> diploma</p>
                <p className="text-5xl font-black text-primaria md:text-6xl">{eleito.apelido}</p>
                <p className="text-lg">
                  como <strong>{e.config.cargo}</strong>
                </p>
                <p className="text-sm text-tinta-suave">
                  Eleito(a) com {ultimo.ranking[0].votos} votos ({ultimo.ranking[0].percentualValidos}% dos válidos) em {data.toLocaleDateString('pt-BR')}.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="text-center">
              <p className="text-2xl font-black">Sem diploma desta vez</p>
              <p className="text-tinta-suave">Não houve candidatura eleita. Vale conversar com a turma sobre o que aconteceu.</p>
            </Card>
          )}
          <Botao tamanho="xl" onClick={avancar} className="w-full">
            Sua vez de verdade →
          </Botao>
        </div>
      </div>
    </Moldura>
  )
}
