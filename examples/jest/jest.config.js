const config = {
  // Send results to Test Analytics
  reporters: [
    'default',
    'buildkite-test-collector/jest/reporter'
  ]
};

module.exports = config;