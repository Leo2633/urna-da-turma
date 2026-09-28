/**
 * Tokens de tema. Troque aqui as cores e logos pela identidade visual desejada.
 * As mesmas cores estão espelhadas como variáveis CSS em src/index.css (@theme).
 */
import type { CorSantinho } from '@/core/tipos'

export const tema = {
  nome: 'Urna da Turma',
  cores: {
    primaria: '#5B3DF5',
    primariaEscura: '#3B22C4',
    secundaria: '#FF7A1A',
    destaque: '#FFD23F',
    fundo: '#F4F1FF',
    superficie: '#FFFFFF',
    tinta: '#1E1B4B',
    tintaSuave: '#4B4877',
    sucesso: '#16A34A',
    perigo: '#DC2626',
    // teclas da urna
    teclaBranco: '#FFFFFF',
    teclaCorrige: '#F97316',
    teclaConfirma: '#16A34A',
  },
  /** Cores dos santinhos (fundo, texto). */
  santinho: {
    roxo: { bg: '#5B3DF5', fg: '#FFFFFF' },
    laranja: { bg: '#FF7A1A', fg: '#1E1B4B' },
    verde: { bg: '#22C55E', fg: '#052E16' },
    azul: { bg: '#2563EB', fg: '#FFFFFF' },
    rosa: { bg: '#F43F8E', fg: '#FFFFFF' },
    amarelo: { bg: '#FFD23F', fg: '#1E1B4B' },
    vermelho: { bg: '#EF4444', fg: '#FFFFFF' },
    ciano: { bg: '#06B6D4', fg: '#082F49' },
  } satisfies Record<CorSantinho, { bg: string; fg: string }>,
  confete: ['#5B3DF5', '#FF7A1A', '#FFD23F', '#22C55E', '#F43F8E', '#06B6D4'],
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
