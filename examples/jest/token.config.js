const config = {
  // Send results to Test Engine
  reporters: [
    'default',
    ['buildkite-test-collector/jest/reporter', { token: process.env.BUILDKITE_ANALYTICS_JEST_TOKEN }]
  ],

  // Enable column + line capture for Test Engine
  testLocationInResults: true
};

module.exports = config;
