import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@contracts': path.resolve(__dirname, './contracts'),
      '@core': path.resolve(__dirname, './core'),
      '@governance': path.resolve(__dirname, './governance'),
      '@skills': path.resolve(__dirname, './skills'),
      '@capabilities': path.resolve(__dirname, './capabilities'),
      '@registry': path.resolve(__dirname, './registry'),
      '@extensions': path.resolve(__dirname, './extensions'),
      '@evaluation': path.resolve(__dirname, './evaluation'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
