import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // La escena 3D (Three.js + motor de física) ocupa ~3,2 MB en un archivo aparte que
    // solo se descarga en la página "Funcionamiento". Es esperado, así que se sube el
    // límite del aviso de tamaño para que no aparezca en cada compilación.
    chunkSizeWarningLimit: 3500,
  },
})
