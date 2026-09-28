import { useEffect, useRef, useState } from 'react'
import { Botao } from '@/components/Botao'
import { useEleicao } from '@/store/useEleicao'
import { som } from '@/audio/urnaSom'

interface Props {
  onOk: () => void
  onCancelar: () => void
}

/** Teclado de PIN de 4 dígitos do mediador. */
export function PinGate({ onOk, onCancelar }: Props) {
  const autenticar = useEleicao((s) => s.autenticarMediador)
  const dica = useEleicao((s) => s.dados?.config.mediador.dicaPin)
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const tentar = (valor: string) => {
    setErro(null)
    setPin(valor)
    if (valor.length !== 4 || ocupado) return
    setOcupado(true)
    void autenticar(valor).then((ok) => {
      setOcupado(false)
      if (ok) {
        onOk()
      } else {
        som.erro()
        setErro('PIN incorreto. Tente de novo.')
        setPin('')
      }
    })
  }

  const tecla = (d: string) => {
    som.tecla()
    if (pin.length < 4) tentar(pin + d)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-tinta-suave">Digite o PIN do mediador para abrir o painel.</p>
      <label className="sr-only" htmlFor="pin">
        PIN de 4 dígitos
      </label>
      <input
        id="pin"
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={(e) => tentar(e.target.value.replace(/\D/g, '').slice(0, 4))}
        className="w-48 rounded-2xl border-4 border-tinta/15 bg-fundo px-4 py-3 text-center text-4xl tracking-[0.6em] focus:border-primaria focus:outline-none"
        aria-describedby="pin-erro"
        autoComplete="off"
      />
      <div className="grid grid-cols-3 gap-2" aria-label="Teclado numérico">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" onClick={() => tecla(d)} className="h-14 w-16 rounded-2xl bg-tinta/5 text-2xl font-black hover:bg-tinta/10 active:translate-y-0.5">
            {d}
          </button>
        ))}
        <button type="button" onClick={() => { som.corrige(); setPin((p) => p.slice(0, -1)) }} className="h-14 w-16 rounded-2xl bg-tinta/5 text-xl font-black hover:bg-tinta/10" aria-label="Apagar">
          ⌫
        </button>
        <button type="button" onClick={() => tecla('0')} className="h-14 w-16 rounded-2xl bg-tinta/5 text-2xl font-black hover:bg-tinta/10">
          0
        </button>
        <span />
      </div>
      <p id="pin-erro" role="alert" className="min-h-6 text-sm font-bold text-perigo">
        {erro}
      </p>
      {dica && <p className="text-xs text-tinta-suave">{dica}</p>}
      <Botao variante="fantasma" tamanho="sm" onClick={onCancelar}>
        Cancelar
      </Botao>
    </div>
  )
}
