let axios = require('axios'), http = require('http')
var BuildkiteReporter = require('buildkite-test-collector/jasmine/reporter');
var buildkiteReporter = new BuildkiteReporter(undefined, { tags: { hello: "jasmine" }});
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

// Test instrumenting a HTTP request against a local server, so the test does
// not depend on any external endpoint.
it('instruments an HTTP request', async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('ok')
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    const { port } = server.address()
    await axios.get(`http://127.0.0.1:${port}/`)
  } finally {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  }
})
