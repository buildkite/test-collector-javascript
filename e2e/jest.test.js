// Does an end-to-end test of the Jest example, using the debug output from the
// reporter, and verifying the JSON

const { exec } = require('child_process');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const path = require('path');

describe('examples/jest', () => {
  test('it posts the correct JSON', (done) => {
    const execOpts = {
      cwd: path.join(__dirname, "../examples/jest"),
      env: {
        ...process.env,
        BUILDKITE_ANALYTICS_TOKEN: "xyz",
        BUILDKITE_ANALYTICS_DEBUG_ENABLED: "true"
      }
    }
    exec('npm test', execOpts, (error, stdout, stderr) => {
      expect(stdout).toMatch(/Posting to Test Analytics: ({.*})/m);

      const jsonMatch = stdout.match(/Posting to Test Analytics: ({.*})/m)
      const json = JSON.parse(jsonMatch[1])

      // Uncomment to view the JSON
      // console.log(json)

      expect(json).toHaveProperty("format", "json")

      expect(json).toHaveProperty("data[0].scope", '')
      expect(json).toHaveProperty("data[0].name", '1 + 2 to equal 3')
      expect(json).toHaveProperty("data[0].identifier", '1 + 2 to equal 3')
      expect(json).toHaveProperty("data[0].location", "example.test.js:2")
      expect(json).toHaveProperty("data[0].file_name", "example.test.js")
      expect(json).toHaveProperty("data[0].result", 'passed')

      expect(json).toHaveProperty("data[1].scope", "sum")
      expect(json).toHaveProperty("data[1].name", "40 + 1 equal 42")
      expect(json).toHaveProperty("data[1].identifier", "sum 40 + 1 equal 42")
      expect(json).toHaveProperty("data[1].location", "example.test.js:8")
      expect(json).toHaveProperty("data[1].file_name", "example.test.js")
      expect(json).toHaveProperty("data[1].result", "failed")
      expect(json).toHaveProperty("data[1].failure_reason")
      expect(json.data[1].failure_reason).toMatch('Error: expect(received).toBe(expected) // Object.is equality\n' +
        '\n' +
        'Expected: 42\n' +
        'Received: 41\n')

      done()
    }, 10000) // 10s timeout
  })
})