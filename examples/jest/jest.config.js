const config = {
  // Send results to Test Engine
  reporters: [
    'default',
    ['buildkite-test-collector/jest/reporter', {
      tags: { hello: "jest" }
    }]
  ],

  // Enable column + line capture for Test Engine
  testLocationInResults: true
};

module.exports = config;
