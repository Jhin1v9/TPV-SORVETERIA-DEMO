import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    css: false,
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        functions: 70,
        branches: 60,
        lines: 70,
        statements: 70,
      },
      include: ['packages/shared/src/**/*'],
      exclude: [
        'packages/shared/src/data/**',
        'packages/shared/src/realtime/**',
        'packages/shared/src/types/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/shared/src'),
      '@shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});
