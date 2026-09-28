import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// Caminhos relativos por padrão: a pasta dist/ funciona em qualquer endereço ou subpasta.
// BASE_PATH fixa um caminho absoluto, se necessário: BASE_PATH=/urna-da-turma/ npm run build
const base = process.env.BASE_PATH ?? './'

export default defineConfig({
  base,
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Urna da Turma',
        short_name: 'Urna da Turma',
        description: 'Eleição gamificada para a sala de aula',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        background_color: '#F4F1FF',
        theme_color: '#5B3DF5',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tudo entra no precache: app, fontes, ilustrações e os JSON editáveis.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,webmanifest,mp3,wav,ogg}'],
        navigateFallback: base === './' ? 'index.html' : `${base}index.html`,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
})
