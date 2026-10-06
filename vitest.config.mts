import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests cover pure logic (features/*/lib, lib) and the architecture rules.
// UI is kept thin on top of that logic, so tests don't need a React Native renderer.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // JSON for scripts/check-coverage.mjs (diff coverage in CI); the summary is for humans.
    coverage: { provider: 'v8', include: ['src/**'], reporter: ['text-summary', 'json'], reportsDirectory: 'coverage' },
  },
});
