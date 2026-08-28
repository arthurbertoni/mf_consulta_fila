import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// Remote 1 — "Consulta de Fila" (visão do cidadão)
// Exposto via Module Federation para que um Host possa consumir <ConsultaFila />.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote1_consulta_fila',
      filename: 'remoteEntry.js',
      exposes: {
        './ConsultaFila': './src/components/ConsultaFila.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
