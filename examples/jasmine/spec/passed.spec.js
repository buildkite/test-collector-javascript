
var BuildkiteReporter = require('buildkite-test-collector/jasmine/reporter');
var buildkiteReporter = new BuildkiteReporter(undefined, { output: process.env.RESULT_PATH });
jasmine.getEnv().addReporter(buildkiteReporter);

it('is true', () => {
  expect(true).toBe(true);
});

