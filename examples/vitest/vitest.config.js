import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: [
      // 'default',
      'buildkite-test-collector/vitest/reporter'
    ]
  }
});
