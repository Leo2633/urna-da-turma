/** Hash do PIN do mediador. Usa SHA-256 quando disponível; senão, FNV-1a (contexto sem HTTPS). */
export async function hashPin(pin: string): Promise<string> {
  const sal = 'urna-da-turma'
  const texto = `${sal}:${pin}`
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `fnv:${h.toString(16)}`
}
