// Does an end-to-end test of the Jest example, using the debug output from the
// reporter, and verifying the JSON

require('dotenv').config();
const { exec } = require('child_process');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const path = require('path');

describe('examples/jasmine', () => {
  const cwd = path.join(__dirname, "../examples/jasmine")
  const env = {
    ...process.env,
    BUILDKITE_ANALYTICS_TOKEN: "xyz",
    BUILDKITE_ANALYTICS_JASMINE_TOKEN: "abc",
    BUILDKITE_ANALYTICS_DEBUG_ENABLED: "true"
  }

  describe('when token is defined through reporter options', () => {
    test('it uses the correct token', (done) => {
      exec('npm test spec/token.spec.js', { cwd, env: { ...env, BUILDKITE_ANALYTICS_TOKEN: undefined } }, (error, stdout, stderr) => {
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
      exec('npm test spec/example.spec.js', { cwd, env }, (error, stdout, stderr) => {
        expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

        const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
        const json = JSON.parse(jsonMatch[1])["headers"]

        expect(json).toHaveProperty("Authorization", 'Token token="xyz"')

        done()
      })
    }, 10000) // 10s timeout
  })

  test('it posts the correct JSON', (done) => {
    exec('npm test spec/example.spec.js', { cwd, env }, (error, stdout, stderr) => {
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

      expect(json).toHaveProperty("tags", { "hello": "jasmine" }) // examples/jasmine/spec/example.spec.js

      expect(json).toHaveProperty("data[0].name", '1 + 2 to equal 3')
      expect(json).toHaveProperty("data[0].location", "spec/example.spec.js:7")
      expect(json).toHaveProperty("data[0].file_name", "spec/example.spec.js")
      expect(json).toHaveProperty("data[0].result", 'passed')

      expect(json).toHaveProperty("data[1].name", "40 + 1 equal 42")
      expect(json).toHaveProperty("data[1].location", "spec/example.spec.js:13")
      expect(json).toHaveProperty("data[1].file_name", "spec/example.spec.js")
      expect(json).toHaveProperty("data[1].result", "failed")
      expect(json).toHaveProperty("data[1].failure_reason")
      expect(json.data[1].failure_reason).toMatch('Expected 41 to be 42.')
      expect(json).toHaveProperty("data[1].failure_expanded[0].expanded[0]", "matcherName: toBe")
      expect(json).toHaveProperty("data[1].failure_expanded[0].expanded[1]", "message: Expected 41 to be 42.")
      expect(json).toHaveProperty("data[1].failure_expanded[0].backtrace[0]", "    at <Jasmine>")

      expect(json).toHaveProperty("data[2].history.section", "top")
      expect(json).toHaveProperty("data[2].history.children[0].section", "http")
      expect(json).toHaveProperty("data[2].history.children[0].detail.lib", "http")
      expect(json).toHaveProperty("data[2].history.children[0].detail.method", "GET")
      expect(json).toHaveProperty("data[2].history.children[0].detail.url", "buildkite.com/")

      done()
    })
  }, 10000) // 10s timeout

  test('it supports test location prefixes for monorepos', (done) => {
    exec('npm test spec/example.spec.js', { cwd, env: { ...env, BUILDKITE_ANALYTICS_LOCATION_PREFIX: "some-sub-dir/" } }, (error, stdout, stderr) => {
      expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

      const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
      const json = JSON.parse(jsonMatch[1])["data"]

      // Uncomment to view the JSON
      // console.log(json)

      expect(json).toHaveProperty("run_env.location_prefix", "some-sub-dir/")

      expect(json).toHaveProperty("data[0].location", "some-sub-dir/spec/example.spec.js:7")
      expect(json).toHaveProperty("data[1].location", "some-sub-dir/spec/example.spec.js:13")

      done()
    })
  }, 10000) // 10s timeout

  describe('when test is pass but upload fails', () => {
    beforeAll(() => {
      // This will cause the upload to fail
      env.BUILDKITE_ANALYTICS_BASE_URL = "http://"
    })

    test('it should not throw an error', done => {
      exec("npm test spec/passed.spec.js", { cwd, env }, (error, stdout) => {
        expect(error).toBeNull()

        done()
      })
    })
  })
})
