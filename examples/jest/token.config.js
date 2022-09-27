const config = {
  // Send results to Test Analytics
  reporters: [
    'default',
    ['buildkite-test-collector/jest/reporter', { token: "abc" }]
  ],

  // Enable column + line capture for Test Analytics
  testLocationInResults: true
};

module.exports = config;
