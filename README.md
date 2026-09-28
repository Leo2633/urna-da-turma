# Urna da Turma

Aplicativo web educativo que simula uma eleição completa dentro de uma turma escolar: candidaturas, horário eleitoral, quiz Fato ou Fake, zerésima, urna simulada, apuração ao vivo, boletim, diploma e a chamada para o alistamento eleitoral. Feito para estudantes de 14 a 18 anos, conduzido por um mediador em sala de aula.

- PWA instalável, 100% offline após o primeiro carregamento. Fontes, sons e ilustrações estão no bundle.
- Sem backend, sem login e sem dados pessoais. Estado salvo em IndexedDB no próprio dispositivo.
- Voto secreto por construção: só existem contadores, nunca registros individuais.
- Interface em português do Brasil, contraste AA, navegação por teclado, respeito a `prefers-reduced-motion`.
- Neutralidade política: nenhuma referência a partidos, políticos ou eleições reais. Sem marcas oficiais; logos entram por configuração.

## Instalação e execução

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:5173. Para testar como PWA offline, use o build:

```bash
npm run build
npm run preview
```

## Testes

A lógica eleitoral (válidos, brancos, nulos, empate, maioria absoluta, segundo turno, zerésima, gamificação) fica em `src/core` e é coberta por Vitest:

```bash
npm test
```

## Arquivos editáveis sem programar

Ficam em `public/dados/` e são lidos ao abrir o app (e guardados em cache para uso offline):

| Arquivo | Conteúdo |
|---|---|
| `config.json` | Nome do app, PIN padrão do mediador, regras (tempo de discurso, tamanho do lote da apuração, padrões), cargos sugeridos, textos das telas (zerésima, brancos e nulos, segundo turno, sua vez), URL do alistamento e caminhos de logos. |
| `quiz.json` | Banco de perguntas do Fato ou Fake. **O conteúdo deve ser validado pelo TRE-PA antes do uso** (aviso no próprio arquivo). |
| `candidatos-ficticios.json` | Personagens prontos para o modo sem exposição individual. |

Depois de editar, recarregue o app uma vez com internet (ou reinstale a PWA) para atualizar o cache.

### Tema, cores e logos

Tokens de cor e logos em `src/theme/theme.ts` e as variáveis CSS espelhadas em `src/index.css` (`@theme`). Para inserir logos, coloque os arquivos em `public/` e aponte o caminho em `dados/config.json` (`logos.principal` e `logos.secundario`) ou em `theme.ts`.

## Build e deploy estático

### GitHub Pages

```bash
npm run build
```

Publique a pasta `dist/` na branch `gh-pages` (por exemplo com `npx gh-pages -d dist`) ou configure GitHub Actions para servir `dist/`. O build usa caminhos relativos, então `dist/` funciona em qualquer endereço ou subpasta.

### Netlify

Build command: `npm run build`. Publish directory: `dist`. Sem redirecionamentos especiais, o app não usa rotas.

## Estrutura

```
public/dados/       JSON editáveis (config, quiz, candidatos fictícios)
src/core/           lógica pura: tipos, fases, votação, apuração, gamificação
src/store/          estado global (zustand) com persistência em IndexedDB
src/adapters/       repositório de persistência e hash do PIN (troca fácil por backend)
src/dados/          carregamento e validação dos JSON
src/theme/          tokens de tema
src/components/     UI compartilhada, mascotes SVG, santinho, trilha de fases, HUD
src/screens/        uma tela por fase
src/mediador/       PIN e painel do mediador
src/audio/          sons sintetizados (Web Audio API)
tests/              Vitest
docs/               roteiro do mediador
```

## Fluxo

1. Configuração (turma, cargo, eleitores, modo de candidatos, maioria absoluta, quiz)
2. Registro de candidatura (apelido, número, slogan, propostas, mascote, cor)
3. Horário eleitoral (carrossel de santinhos com cronômetro)
4. Fato ou Fake (opcional)
5. Zerésima
6. Votação na urna simulada (teclado na tela e físico, sons sintetizados, tela de espera liberada pelo mediador)
7. Apuração ao vivo (lotes animados, brancos e nulos, comparecimento e abstenção, segundo turno)
8. Boletim de urna (imprimível) e diploma
9. Sua vez de verdade (QR code gerado localmente)

Gamificação coletiva: XP e nível da turma, conquistas "Comparecimento Total", "Eleição sem Nulos", "Turma Checadora" e "Democracia em Dois Turnos". Nunca há ranking individual.

## Fora do escopo do MVP (arquitetura preparada)

- Votação pelos celulares via QR code em tempo real: implementar `EleicaoRepositorio` em `src/adapters/repositorio.ts` com um backend (ex.: Supabase) e trocar `criarRepositorio()`.
- Ranking entre turmas e escolas e painel de estatísticas agregadas: o objeto `Eleicao` já contém tudo que precisaria ser enviado (sem dados pessoais).

## Privacidade

Nenhum dado sai do dispositivo. Candidatos são identificados apenas por apelido, eleitores são anônimos e não há upload de fotos. O botão "Nova eleição" no painel do mediador apaga tudo.
