// Does an end-to-end test of the Mocha example, using the debug output from the
// reporter, and verifying the JSON
require('dotenv').config();
const { exec } = require('child_process');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const path = require('path');

describe('examples/mocha', () => {
  const cwd = path.join(__dirname, "../examples/mocha")
  const env = {
    ...process.env,
    BUILDKITE_ANALYTICS_TOKEN: "xyz",
    BUILDKITE_ANALYTICS_MOCHA_TOKEN: "abc",
    BUILDKITE_ANALYTICS_DEBUG_ENABLED: "true"
  }

  describe('when token is defined through reporter options', () => {
    test('it uses the correct token', (done) => {
      exec('mocha --reporter mocha-multi-reporters --reporter-options configFile=token-config.json',
      { cwd, env: { ...env, BUILDKITE_ANALYTICS_TOKEN: undefined } }, (error, stdout, stderr) => {
        expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

        const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
        const json = JSON.parse(jsonMatch[1])["headers"]

        expect(json).toHaveProperty("Authorization", 'Token token="abc"')

        done()
      })
    }, 10000) // 10s timeout
  })

  describe('when token is defined through BUILDKITE_ANALYTICS_TOKEN', () => {
    test('it uses the correct token', (done) => {
      exec('npm test', { cwd, env }, (error, stdout, stderr) => {
        expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

        const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
        const json = JSON.parse(jsonMatch[1])["headers"]

        expect(json).toHaveProperty("Authorization", 'Token token="xyz"')

        done()
      })
    }, 10000) // 10s timeout
  })


  test('it posts the correct JSON', (done) => {
    exec('npm test', { cwd, env }, (error, stdout, stderr) => {
      expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

      const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
      const json = JSON.parse(jsonMatch[1])["data"]

      // Uncomment to view the JSON
      // console.log(json)

      expect(json).toHaveProperty("format", "json")

      expect(json).toHaveProperty("run_env.ci")
      expect(json).toHaveProperty("run_env.debug", 'true')
      expect(json).toHaveProperty("run_env.key")
      expect(json).toHaveProperty("run_env.version")
      expect(json).toHaveProperty("run_env.collector", "js-buildkite-test-collector")

      expect(json).toHaveProperty("data[0].name", '1 + 2 to equal 3')
      expect(json).toHaveProperty("data[0].identifier", '1 + 2 to equal 3')
      expect(json).toHaveProperty("data[0].location", "test.js") // Mocha does not report test line numbers, otherwise we'd see it here
      expect(json).toHaveProperty("data[0].file_name", "test.js")
      expect(json).toHaveProperty("data[0].result", 'passed')

      expect(json).toHaveProperty("data[1].scope", "sum")
      expect(json).toHaveProperty("data[1].name", "40 + 1 equal 42")
      expect(json).toHaveProperty("data[1].identifier", "sum 40 + 1 equal 42")
      expect(json).toHaveProperty("data[1].location", "test.js")  // Mocha does not report test line numbers, otherwise we'd see it here
      expect(json).toHaveProperty("data[1].file_name", "test.js")
      expect(json).toHaveProperty("data[1].result", "failed")
      expect(json).toHaveProperty("data[1].failure_reason")
      expect(json.data[1].failure_reason).toMatch('AssertionError [ERR_ASSERTION]: 41 == 42')
      expect(json).toHaveProperty("data[1].failure_expanded[0].expanded")
      expect(json).toHaveProperty("data[1].failure_expanded[0].backtrace")

      done()
    })
  }, 10000) // 10s timeout

  test('it supports test location prefixes for monorepos', (done) => {
    exec('npm test', { cwd, env: { ...env, BUILDKITE_ANALYTICS_LOCATION_PREFIX: "some-sub-dir/" } }, (error, stdout, stderr) => {
      expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

      const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
      const json = JSON.parse(jsonMatch[1])["data"]

      // Uncomment to view the JSON
      // console.log(json)

      expect(json).toHaveProperty("run_env.location_prefix", "some-sub-dir/")

      expect(json).toHaveProperty("data[0].location", "some-sub-dir/test.js")
      expect(json).toHaveProperty("data[1].location", "some-sub-dir/test.js")

      done()
    })
  }, 10000) // 10s timeout
})
