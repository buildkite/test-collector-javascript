var BuildkiteReporter = require('buildkite-test-collector/jasmine/reporter');
var buildkiteReporter = new BuildkiteReporter();

jasmine.getEnv().addReporter(buildkiteReporter);

// No scope
it('1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

// In a scope
describe('sum', () => {
  it('40 + 1 equal 42', () => {
    expect(40 + 1).toBe(42);
  });
})