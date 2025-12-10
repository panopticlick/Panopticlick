import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/.next/**',
        '**/types/**',
      ],
    },
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@panopticlick/types': path.resolve(__dirname, './packages/types/src'),
      '@panopticlick/valuation-engine': path.resolve(__dirname, './packages/valuation-engine/src'),
      '@panopticlick/fingerprint-sdk': path.resolve(__dirname, './packages/fingerprint-sdk/src'),
    },
  },
});
