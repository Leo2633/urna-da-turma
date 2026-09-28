/**
 * Camada de persistência. Hoje: IndexedDB local (idb-keyval).
 * Preparada para trocar por um backend (ex.: Supabase) sem mexer nas telas:
 * basta implementar EleicaoRepositorio e registrar em criarRepositorio().
 */
import { del, get, set } from 'idb-keyval'
import type { Eleicao } from '@/core/tipos'

export interface EleicaoRepositorio {
  carregar(): Promise<Eleicao | null>
  salvar(e: Eleicao): Promise<void>
  apagar(): Promise<void>
}

const CHAVE = 'urna-da-turma:eleicao-atual'

export class RepositorioIndexedDB implements EleicaoRepositorio {
  async carregar() {
    try {
      return (await get<Eleicao>(CHAVE)) ?? null
    } catch {
      return null
    }
  }
  async salvar(e: Eleicao) {
    await set(CHAVE, e)
  }
  async apagar() {
    await del(CHAVE)
  }
}

export function criarRepositorio(): EleicaoRepositorio {
  return new RepositorioIndexedDB()
}
