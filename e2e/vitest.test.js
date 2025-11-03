// Does an end-to-end test of the vitest example, using the debug output from the
// reporter, and verifying the JSON
require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');

describe('examples/vitest', () => {
	const cwd = path.join(__dirname, "../examples/vitest")
	const env = {
		...process.env,
		BUILDKITE_ANALYTICS_TOKEN: "xyz",
		BUILDKITE_ANALYTICS_VITEST_TOKEN: "abc",
		BUILDKITE_ANALYTICS_DEBUG_ENABLED: "true"
	}

	describe('when token is defined through reporter options', () => {
		test('it uses the correct token', (done) => {
			exec('vitest test --config token.config.js', { cwd, env: { ...env, BUILDKITE_ANALYTICS_TOKEN: undefined } }, (error, stdout, stderr) => {
				expect(stdout).toMatch(/.*Test Engine Sending: ({.*})/m);

				const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
				const json = JSON.parse(jsonMatch[1])["headers"]

				expect(json).toHaveProperty("Authorization", 'Token token="abc"')

				done()
			})
		}, 10000) // 10s timeout
	})

	describe('when token is defined through BUILDKITE_ANALYTICS_TOKEN', () => {
		test('it uses the correct token', (done) => {
			exec('npm test', { cwd, env }, (error, stdout, stderr) => {
				expect(stdout).toMatch(/.*Test Engine Sending: ({.*})/m);

				const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
				const json = JSON.parse(jsonMatch[1])["headers"]

				expect(json).toHaveProperty("Authorization", 'Token token="xyz"')

				done()
			})
		}, 10000) // 10s timeout
	})

	test('it posts the correct JSON', (done) => {
		exec('npm test', { cwd, env }, (error, stdout, stderr) => {
			expect(stdout).toMatch(/.*Test Engine Sending: ({.*})/m);

			const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
			const json = JSON.parse(jsonMatch[1])["data"]

			// Uncomment to view the JSON
			// console.log(json)

			expect(json).toHaveProperty("format", "json")

			expect(json).toHaveProperty("run_env.ci")
			expect(json).toHaveProperty("run_env.debug", 'true')
			expect(json).toHaveProperty("run_env.key")
			expect(json).toHaveProperty("run_env.version")
			expect(json).toHaveProperty("run_env.collector", "js-buildkite-test-collector")

			expect(json).toHaveProperty("tags", { "hello": "vitest" }) // examples/vitest/vitest.config.js

			expect(json).toHaveProperty("data[0].scope", '')
			expect(json).toHaveProperty("data[0].name", '1 + 2 to equal 3')
			expect(json).toHaveProperty("data[0].location", "example.test.js:4")
			expect(json).toHaveProperty("data[0].file_name", "example.test.js")
			expect(json).toHaveProperty("data[0].result", 'passed')

			expect(json).toHaveProperty("data[1].scope", "sum")
			expect(json).toHaveProperty("data[1].name", "40 + 1 equal 42")
			expect(json).toHaveProperty("data[1].location", "example.test.js:10")
			expect(json).toHaveProperty("data[1].file_name", "example.test.js")
			expect(json).toHaveProperty("data[1].result", "failed")
			expect(json).toHaveProperty("data[1].failure_reason")
			expect(json.data[1].failure_reason).toEqual('AssertionError: expected 41 to be 42 // Object.is equality')

			expect(json).toHaveProperty("data[1].failure_expanded")
			expect(json.data[1].failure_expanded).toEqual(expect.arrayContaining([
				expect.objectContaining({
					expanded: expect.arrayContaining([expect.stringContaining("vitest/example.test.js\:11\:20")])
				})
			]))

			expect(json).toHaveProperty("data[0].history")

			const firstHistory = json.data[0].history
			expect(firstHistory).toHaveProperty("section", "top")
			expect(firstHistory).toHaveProperty("start_at", expect.any(Number))
			expect(firstHistory.start_at).toBeGreaterThanOrEqual(0)
			expect(firstHistory).toHaveProperty("end_at", expect.any(Number))
			expect(firstHistory.end_at).toBeGreaterThan(firstHistory.start_at)
			expect(firstHistory).toHaveProperty("duration", expect.any(Number))
			expect(firstHistory.duration).toBeGreaterThan(0)

			const secondHistory = json.data[1].history
			expect(secondHistory).toHaveProperty("section", "top")
			expect(secondHistory).toHaveProperty("start_at", expect.any(Number))
			expect(secondHistory.start_at).toBeGreaterThanOrEqual(0)
			expect(secondHistory).toHaveProperty("end_at", expect.any(Number))
			expect(secondHistory.end_at).toBeGreaterThan(secondHistory.start_at)
			expect(secondHistory).toHaveProperty("duration", expect.any(Number))
			expect(secondHistory.duration).toBeGreaterThan(0)

			done()
		})
	}, 10000) // 10s timeout

	test('it supports test location prefixes for monorepos', (done) => {
		exec('npm test', { cwd, env: { ...env, BUILDKITE_ANALYTICS_LOCATION_PREFIX: "some-sub-dir/" } }, (error, stdout, stderr) => {
			expect(stdout).toMatch(/.*Test Engine Sending: ({.*})/m);

			const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
			const json = JSON.parse(jsonMatch[1])["data"]

			// Uncomment to view the JSON
			// console.log(json)

			expect(json).toHaveProperty("run_env.location_prefix", "some-sub-dir/")

			expect(json).toHaveProperty("data[0].location", "some-sub-dir/example.test.js:4")
			expect(json).toHaveProperty("data[1].location", "some-sub-dir/example.test.js:10")

			done()
		})
	}, 10000) // 10s timeout

	test('it handles no location being present', (done) => {
		exec('npm test -- --config vitest.override.config.js', { cwd, env }, (error, stdout, stderr) => {
			expect(stdout).toMatch(/.*Test Engine Sending: ({.*})/m);

			const jsonMatch = stdout.match(/.*Test Engine Sending: ({.*})/m)
			const json = JSON.parse(jsonMatch[1])["data"]

			// Uncomment to view the JSON
			// console.log(json)

			expect(json).toHaveProperty("data[0].location", null)
			expect(json).toHaveProperty("data[1].location", null)

			done()
		})
	}, 10000) // 10s timeout

	describe('when test is pass but upload fails', () => {
		beforeAll(() => {
			// This will cause the upload to fail
			env.BUILDKITE_ANALYTICS_BASE_URL = "http://"
		})

		test('it should not throw an error', (done) => {
			exec('npm test passed.test.js', { cwd, env }, (error, stdout, stderr) => {
				//console.log(stdout)
				expect(error).toBeNull()

				done()
			})
		})
	})
})
