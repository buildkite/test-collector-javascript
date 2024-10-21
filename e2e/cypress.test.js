// Does an end-to-end test of the Mocha example, using the debug output from the
// reporter, and verifying the JSON
require('dotenv').config();
const { exec } = require('child_process');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const path = require('path');

const DEFAULT_TIMEOUT = 20000 // 20s timeout

describe('examples/cypress', () => {
  const cwd = path.join(__dirname, "../examples/cypress")
  const env = {
    ...process.env,
    BUILDKITE_ANALYTICS_TOKEN: "xyz",
    BUILDKITE_ANALYTICS_CYPRESS_TOKEN: "abc",
    BUILDKITE_ANALYTICS_DEBUG_ENABLED: "true",
  }

  describe('when token is defined through config', () => {
    test('it uses the correct token', (done) => {
      exec('npm test -- --config-file cypress.config.token.js',
        { cwd, env: { ...env, BUILDKITE_ANALYTICS_TOKEN: undefined } }, (error, stdout, stderr) => {
          expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

          const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
          const json = JSON.parse(jsonMatch[1])["headers"]

          expect(json).toHaveProperty("Authorization", 'Token token="abc"')

          done()
        })
    }, DEFAULT_TIMEOUT)
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
    }, DEFAULT_TIMEOUT)
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

      expect(json).toHaveProperty("data[0].name", 'renders')
      expect(json).toHaveProperty("data[0].identifier", '<Component /> renders')
      expect(json).toHaveProperty("data[0].location", "cypress/component/Component.cy.jsx") // Cypress does not report test line numbers, otherwise we'd see it here
      expect(json).toHaveProperty("data[0].file_name", "cypress/component/Component.cy.jsx")
      expect(json).toHaveProperty("data[0].result", 'passed')

      expect(json).toHaveProperty("data[1].scope", "<Component />")
      expect(json).toHaveProperty("data[1].name", "fails")
      expect(json).toHaveProperty("data[1].identifier", "<Component /> fails")
      expect(json).toHaveProperty("data[1].location", "cypress/component/Component.cy.jsx")  // Cypress does not report test line numbers, otherwise we'd see it here
      expect(json).toHaveProperty("data[1].file_name", "cypress/component/Component.cy.jsx")
      expect(json).toHaveProperty("data[1].result", "failed")
      expect(json).toHaveProperty("data[1].failure_reason")
      expect(json.data[1].failure_reason).toMatch("expected '<label#label>' to have text 'Label2', but the text was 'Label'")
      expect(json).toHaveProperty("data[1].failure_expanded[0].expanded")
      expect(json).toHaveProperty("data[1].failure_expanded[0].backtrace")

      expect(stdout).toMatch(/Test Analytics .* response/m)
      done()
    })
  }, DEFAULT_TIMEOUT)

  test('it supports test location prefixes for monorepos', (done) => {
    exec('npm test', { cwd, env: { ...env, BUILDKITE_ANALYTICS_LOCATION_PREFIX: "some-sub-dir/" } }, (error, stdout, stderr) => {
      expect(stdout).toMatch(/.*Test Analytics Sending: ({.*})/m);

      const jsonMatch = stdout.match(/.*Test Analytics Sending: ({.*})/m)
      const json = JSON.parse(jsonMatch[1])["data"]

      // Uncomment to view the JSON
      // console.log(json)

      expect(json).toHaveProperty("run_env.location_prefix", "some-sub-dir/")

      expect(json).toHaveProperty("data[0].location", "some-sub-dir/cypress/component/Component.cy.jsx")
      expect(json).toHaveProperty("data[1].location", "some-sub-dir/cypress/component/Component.cy.jsx")

      done()
    })
  }, DEFAULT_TIMEOUT)

  describe('when test is pass but upload fails', () => {
    beforeAll(() => {
      // This will cause the upload to fail
      env.BUILDKITE_ANALYTICS_BASE_URL = "http://"
    })

    test('it should not throw an error', (done) => {
      exec('npm test -- --spec cypress/component/passed.cy.js', { cwd, env }, (error, stdout, stderr) => {
        expect(error).toBeNull()

        done()
      })
    }, DEFAULT_TIMEOUT)
  })
})
