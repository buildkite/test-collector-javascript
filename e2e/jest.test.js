// Does an end-to-end test of the Jest example, using the debug output from the
// reporter, and verifying the JSON
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { exec } = require('child_process');
const { hasUncaughtExceptionCaptureCallback } = require('process');

describe('examples/jest', () => {
  const cwd = path.join(__dirname, "../examples/jest")
  const env = {
    ...process.env,
    BUILDKITE_ANALYTICS_TOKEN: "xyz",
    BUILDKITE_ANALYTICS_JEST_TOKEN: "abc",
    BUILDKITE_ANALYTICS_DEBUG_ENABLED: "true"
  }

  describe('when token is defined through reporter options', () => {
    test('it uses the correct token', (done) => {
      exec('jest --config token.config.js', { cwd, env: { ...env, BUILDKITE_ANALYTICS_TOKEN: undefined } }, (error, stdout, stderr) => {
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

  describe('when output is set', () => {
    const location = `test-result-${Date.now()}.json`
    test('it writes the output to the correct file', (done) => {
      exec('npm test',
        { cwd, env: { ...env, RESULT_PATH: location } }, (error, stdout, stderr) => {
          const resultPath = path.resolve(cwd, location)

          expect(fs.existsSync(resultPath)).toEqual(true)

          fs.unlinkSync(resultPath)

          done()
        }
      )
    })
  });

  test('it outputs a warning when --forceExit option is used', (done) => {
    exec('jest --forceExit', { cwd, env }, (error, stdout, stderr) => {
      expect(stderr).toMatch(/--forceExit could potentially terminate any ongoing processes that are attempting to send test executions to Buildkite./);

      done()
    })
  }, 10000) // 10s timeout

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

      expect(json).toHaveProperty("data[0].scope", '')
      expect(json).toHaveProperty("data[0].name", '1 + 2 to equal 3')
      expect(json).toHaveProperty("data[0].location", "example.test.js:2")
      expect(json).toHaveProperty("data[0].file_name", "example.test.js")
      expect(json).toHaveProperty("data[0].result", 'passed')

      expect(json).toHaveProperty("data[1].scope", "sum")
      expect(json).toHaveProperty("data[1].name", "40 + 1 equal 42")
      expect(json).toHaveProperty("data[1].location", "example.test.js:8")
      expect(json).toHaveProperty("data[1].file_name", "example.test.js")
      expect(json).toHaveProperty("data[1].result", "failed")
      expect(json).toHaveProperty("data[1].failure_reason")
      expect(json.data[1].failure_reason).toEqual('Error: expect(received).toBe(expected) // Object.is equality')

      expect(json).toHaveProperty("data[1].failure_expanded")
      expect(json.data[1].failure_expanded).toEqual(expect.arrayContaining([
        expect.objectContaining({
          expanded: expect.arrayContaining(["Expected: 42", "Received: 41"])
        })
      ]))
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

      expect(json).toHaveProperty("data[0].location", "some-sub-dir/example.test.js:2")
      expect(json).toHaveProperty("data[1].location", "some-sub-dir/example.test.js:8")

      done()
    })
  }, 10000) // 10s timeout
})
