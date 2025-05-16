const config = {
  // Send results to Test Engine
  test: {
    reporters: [
      'default',
      ['buildkite-test-collector/vitest/reporter', { 
        token: process.env.BUILDKITE_ANALYTICS_VITEST_TOKEN,
      }]
    ],
    includeTaskLocation: true,
  }
};

export default config;
