const config = {
  // Send results to Test Engine
  test: {
    reporters: [
      'default',
      ['buildkite-test-collector/vitest/reporter', { 
        tags: { hello: "vitest" }
      }]
    ],
    includeTaskLocation: true,
  }
};

export default config;
