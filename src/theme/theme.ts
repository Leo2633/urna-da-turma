/**
 * Tokens de tema. Troque aqui as cores e logos pela identidade visual desejada.
 * As mesmas cores estão espelhadas como variáveis CSS em src/index.css (@theme).
 */
import type { CorSantinho } from '@/core/tipos'

export const tema = {
  nome: 'Urna da Turma',
  cores: {
    primaria: '#2236FF',
    primariaEscura: '#1524C4',
    secundaria: '#FF3D81',
    destaque: '#C8F526',
    fundo: '#EFEFF5',
    superficie: '#FFFFFF',
    tinta: '#12101F',
    tintaSuave: '#55536B',
    sucesso: '#0A855A',
    perigo: '#D11F30',
    // teclas da urna
    teclaBranco: '#FFFFFF',
    teclaCorrige: '#F97316',
    teclaConfirma: '#16A34A',
  },
  /** Cores dos santinhos (fundo, texto). */
  santinho: {
    roxo: { bg: '#6D28FF', fg: '#FFFFFF' },
    laranja: { bg: '#FF6A13', fg: '#12101F' },
    verde: { bg: '#12B76A', fg: '#03241A' },
    azul: { bg: '#2236FF', fg: '#FFFFFF' },
    rosa: { bg: '#FF3D81', fg: '#12101F' },
    amarelo: { bg: '#FFD60A', fg: '#12101F' },
    vermelho: { bg: '#E02D3C', fg: '#FFFFFF' },
    ciano: { bg: '#14C8E0', fg: '#062A33' },
  } satisfies Record<CorSantinho, { bg: string; fg: string }>,
  confete: ['#2236FF', '#FF3D81', '#C8F526', '#14C8E0', '#6D28FF', '#12101F'],
  /**
   * Placeholders de logo. Preencha com caminhos em public/ (ex.: "logos/tre-pa.svg")
   * ou deixe vazio. Também podem ser definidos em dados/config.json (logos).
   */
  logos: {
    principal: '',
    secundario: '',
  },
}

export type Tema = typeof tema
