// Does an end-to-end test of the Playwright example, using the debug output from the
// reporter, and verifying the JSON
require('dotenv').config();
const { exec, spawn } = require('child_process');
const path = require('path');

const TIMEOUT = 20000;

const cwd = path.join(__dirname, "../examples/playwright");
const runPlaywright = (args, env) => {

  return new Promise((resolve) => {
    const command = `npm test -- ${args.join(' ')}`
    exec(command, { cwd, env: { ...env, JEST_WORKER_ID: undefined } }, (error, stdout) => {
      resolve(stdout)
    })
  })
}

const expectOutputToHaveToken = (stdout, expectation) => {
  const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
  const headers = JSON.parse(jsonMatch[1])["headers"]

  expect(headers).toHaveProperty("Authorization", `Token token="${expectation}"`)
}

describe('examples/playwright', () => {
  const env = {
    ...process.env,
    BUILDKITE_ANALYTICS_TOKEN: "xyz",
    BUILDKITE_ANALYTICS_DEBUG_ENABLED: "true"
  }

  describe('when token is defined through reporter options', () => {
    test('it uses the correct token', async () => {
      const stdout = await runPlaywright(["--config", "token.config.js"], { ...env, BUILDKITE_ANALYTICS_PLAYWRIGHT_TOKEN: 'abc' })

      expectOutputToHaveToken(stdout, 'abc')
    }, TIMEOUT)
  });

  describe('when token is defined through BUILDKITE_ANALYTICS_TOKEN', () => {
    test('it uses the correct token', async () => {
      const stdout = await runPlaywright([], env)

      expectOutputToHaveToken(stdout, 'xyz')
    }, TIMEOUT)
  });

  test('it posts the correct JSON', async () => {
    const stdout = await runPlaywright([], env)

    const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
    const data = JSON.parse(jsonMatch[1])["data"]

    expect(data).toHaveProperty("format", "json")

    expect(data).toHaveProperty("run_env.ci")
    expect(data).toHaveProperty("run_env.debug", 'true')
    expect(data).toHaveProperty("run_env.key")
    expect(data).toHaveProperty("run_env.version")
    expect(data).toHaveProperty("run_env.collector", "js-buildkite-test-collector")

    expect(data).toHaveProperty("data[0].scope", ' chromium example.spec.js has title')
    expect(data).toHaveProperty("data[0].name", 'has title')
    expect(data).toHaveProperty("data[0].location", "tests/example.spec.js:3:1")
    expect(data).toHaveProperty("data[0].file_name", "tests/example.spec.js")
    expect(data).toHaveProperty("data[0].result", "passed")

    expect(data).toHaveProperty("data[1].scope", " chromium example.spec.js says hello")
    expect(data).toHaveProperty("data[1].name", "says hello")
    expect(data).toHaveProperty("data[1].location", "tests/example.spec.js:9:1")
    expect(data).toHaveProperty("data[1].file_name", "tests/example.spec.js")
    expect(data).toHaveProperty("data[1].result", "failed")
    expect(data).toHaveProperty("data[1].failure_reason", expect.stringContaining("expect(locator).toHaveText(expected)"))
    expect(data).toHaveProperty("data[1].failure_expanded", expect.arrayContaining([
      expect.objectContaining({
        expanded: expect.arrayContaining([expect.stringContaining('"Hello, World!"')])
      })
    ]))

    expect(data).toHaveProperty("data[2].tags", { foo: "bar" });
    expect(data).toHaveProperty("data[3].tags", { foo: "bar", baz: 'qux' });
    expect(data).toHaveProperty("data[4].tags", {});

    expect(stdout).toMatch(/Test Engine .* response/m)
  }, TIMEOUT);

  describe('when --retries option is used', () => {
    test("it posts all retried executions", async () => {
      const stdout = await runPlaywright(["--retries=1"], env)

      const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
      const data = JSON.parse(jsonMatch[1])["data"]["data"];

      const retriedTest = data.filter(test => test.name === "says hello")
      expect(retriedTest.length).toEqual(2)
      expect(retriedTest.map(test => test.result)).toEqual(["failed", "passed"])
      expect(stdout).toMatch(/Test Engine .* response/m)
    }, TIMEOUT)
  })

  describe('when --timeout is exceeded', () => {
    test("it posts the failures", async () => {
      const stdout = await runPlaywright(["--timeout=1"], env)

      const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
      const data = JSON.parse(jsonMatch[1])["data"];

      expect(data).toHaveProperty("format", "json")

      expect(data).toHaveProperty("run_env.ci")
      expect(data).toHaveProperty("run_env.debug", 'true')
      expect(data).toHaveProperty("run_env.key")
      expect(data).toHaveProperty("run_env.version")
      expect(data).toHaveProperty("run_env.collector", "js-buildkite-test-collector")

      expect(data).toHaveProperty("data[0].scope", ' chromium example.spec.js has title')
      expect(data).toHaveProperty("data[0].name", 'has title')
      expect(data).toHaveProperty("data[0].location", "tests/example.spec.js:3:1")
      expect(data).toHaveProperty("data[0].file_name", "tests/example.spec.js")
      expect(data).toHaveProperty("data[0].result", 'failed')
      expect(data).toHaveProperty("data[1].failure_reason", expect.stringContaining("Test timeout of 1ms exceeded while setting up"))
      expect(data).toHaveProperty("data[1].failure_expanded", expect.arrayContaining([
        expect.objectContaining({
          expanded: expect.arrayContaining([expect.stringContaining("Test timeout of 1ms exceeded while setting up")])
        })
      ]))

      expect(data).toHaveProperty("data[1].scope", " chromium example.spec.js says hello")
      expect(data).toHaveProperty("data[1].name", "says hello")
      expect(data).toHaveProperty("data[1].location", "tests/example.spec.js:9:1")
      expect(data).toHaveProperty("data[1].file_name", "tests/example.spec.js")
      expect(data).toHaveProperty("data[1].result", "failed")
      expect(data).toHaveProperty("data[1].failure_reason", expect.stringContaining("Test timeout of 1ms exceeded while setting up"))
      expect(data).toHaveProperty("data[1].failure_expanded", expect.arrayContaining([
        expect.objectContaining({
          expanded: expect.arrayContaining([expect.stringContaining("Test timeout of 1ms exceeded while setting up")])
        })
      ]))
      expect(stdout).toMatch(/Test Engine .* response/m)
    }, TIMEOUT)
  })

  test('it supports test location prefixes for monorepos', async () => {
    const stdout = await runPlaywright([], { ...env, BUILDKITE_ANALYTICS_LOCATION_PREFIX: "some-sub-dir/" })

    const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
    const data = JSON.parse(jsonMatch[1])["data"]

    expect(data).toHaveProperty("run_env.location_prefix", "some-sub-dir/")

    expect(data).toHaveProperty("data[0].location", "some-sub-dir/tests/example.spec.js:3:1")
    expect(data).toHaveProperty("data[1].location", "some-sub-dir/tests/example.spec.js:9:1")
  }, TIMEOUT);

  describe('when test is pass but upload fails', () => {
    beforeAll(() => {
      // This will cause the upload to fail
      env.BUILDKITE_ANALYTICS_BASE_URL = "http://"
    })
    test('it should not throw an error', done => {
      exec("npm test example.spec.js:3", { cwd, env: { ...env, JEST_WORKER_ID: undefined } }, (error, stdout) => {
        expect(error).toBeNull()

        done()
      })
    }, TIMEOUT)
  })
});
