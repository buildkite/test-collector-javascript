const JestBuildkiteAnalyticsReporter = require('./reporter');
const axios = require('axios');
const { version } = require('../package.json')

jest.mock('axios');

const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

var OLD_ENV;

beforeEach(() => {
  OLD_ENV = process.env;
  consoleLogSpy.mockClear();
  consoleErrorSpy.mockClear();
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('with no token', () => {
  beforeEach(() => {
    delete process.env.BUILDKITE_ANALYTICS_TOKEN
  })

  it('prints a console message and returns', () => {
    const reporter = new JestBuildkiteAnalyticsReporter({}, {})
    reporter.onRunComplete({}, {})

    expect(console.error).toBeCalledTimes(1)
    expect(console.error).toHaveBeenLastCalledWith('Missing BUILDKITE_ANALYTICS_TOKEN')
  })
})

describe('with empty token', () => {
  beforeEach(() => {
    process.env.BUILDKITE_ANALYTICS_TOKEN = ''
  })

  it('prints a console message and returns', () => {
    const reporter = new JestBuildkiteAnalyticsReporter({}, {})
    reporter.onRunComplete({}, {})

    expect(console.error).toBeCalledTimes(1)
    expect(console.error).toHaveBeenLastCalledWith('Missing BUILDKITE_ANALYTICS_TOKEN')
  })
})

describe('with token "abc"', () => {
  beforeEach(() => {
    process.env.BUILDKITE_ANALYTICS_TOKEN = 'abc';
    process.env.BUILDKITE_ANALYTICS_KEY = 'key123';
  })

  describe('result chunking', () => {
    it('posts a result', () => {
      axios.post.mockResolvedValue({ data: "Success" })

      const reporter = new JestBuildkiteAnalyticsReporter({}, {})
      reporter._testResults = ['result']
      reporter.onRunComplete({}, {})

      expect(axios.post.mock.calls[0]).toEqual([
        "https://analytics-api.buildkite.com/v1/uploads",
        {
          "data": [ "result" ],
          "format": "json",
          "run_env": {
            "ci": "generic",
            "collector": "js-buildkite-test-collector",
            "key": "key123",
            "version": version
          }
        },
        {
          "headers": {
            "Authorization": "Token token=\"abc\"",
            "Content-Type": "application/json",
          }
        }
      ])
    })

    it('does a single posts if < 5000', () => {
      axios.post.mockResolvedValue({ data: "Success" });
      
      const reporter = new JestBuildkiteAnalyticsReporter({}, {})
      reporter._testResults = Array(4999).fill('result')
      reporter.onRunComplete({}, {})

      expect(axios.post.mock.calls.length).toBe(1)
    })

    it('posts 5000 results at a time', () => {
      axios.post.mockResolvedValue({ data: "Success" })
      
      const reporter = new JestBuildkiteAnalyticsReporter({}, {})
      reporter._testResults = Array(12000).fill('result')
      reporter.onRunComplete({}, {})

      expect(axios.post.mock.calls.length).toBe(3)
    })
  })
})
