import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      png: { quality: 70 },   // Calidad para PNG
      jpeg: { quality: 70 },  // Calidad para JPEG
      webp: { quality: 70 },  // Calidad para WebP
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5174,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
