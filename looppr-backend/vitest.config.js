import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    hookTimeout: 30000,
    testTimeout: 15000,
    // Integration tests share one in-memory Mongo instance (see
    // tests/setup.js) — run test files serially so they don't race on it.
    fileParallelism: false,
  },
})
