const config = {
  // Send results to Test Analytics
  reporters: [
    'default',
    ['buildkite-test-collector/jest/reporter', { token: process.env.BUILDKITE_ANALYTICS_JEST_TOKEN }]
  ]
};

module.exports = config;
