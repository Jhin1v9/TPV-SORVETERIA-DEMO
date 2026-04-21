import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: __dirname,
  envDir: '../../',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tpv/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@/lib/utils': path.resolve(__dirname, '../../packages/shared/src/lib/utils'),
      '@/components': path.resolve(__dirname, '../../packages/shared/src/components'),
      '@/hooks': path.resolve(__dirname, '../../packages/shared/src/hooks'),
    },
  },
  css: {
    postcss: path.resolve(__dirname, '../../postcss.config.js'),
  },
  build: {
    outDir: '../../dist/kiosk',
    emptyOutDir: true,
  },
})
