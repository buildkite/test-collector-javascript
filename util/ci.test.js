const CI = require('./ci');

describe('CI.env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('returns analytics environment variable information', () => {
    process.env.BUILDKITE_ANALYTICS_KEY = 'secret-key'
    process.env.BUILDKITE_ANALYTICS_BRANCH = 'main'

    ci = new CI()

    expect(ci.env().key).toEqual('secret-key')
    expect(ci.env().branch).toEqual('main')
  });

  test('removes blank enviroment variables', () => {
    ci = new CI()

    expect(ci.env().hasOwnProperty('branch')).toBeFalsy()
  })

  test('uses buildkite environment variables first', () => {
    process.env.BUILDKITE_BUILD_ID = '42'
    ci = new CI()

    expect(ci.env().ci).toEqual('buildkite')
  })

  test('uses github action environment variables second', () => {
    process.env.GITHUB_RUN_NUMBER = '43'
    ci = new CI()

    expect(ci.env().ci).toEqual('github_actions')
  })

  test('prefers buildkite environment variables when there are multiple sets', () => {
    process.env.BUILDKITE_BUILD_ID = '42'
    process.env.GITHUB_RUN_NUMBER = '43'
    ci = new CI()

    expect(ci.env().ci).toEqual('buildkite')
  })

  test('sets location_prefix based on BUILDKITE_ANALYTICS_LOCATION_PREFIX', () => {
    process.env.BUILDKITE_ANALYTICS_LOCATION_PREFIX = 'true'
    ci = new CI()

    expect(ci.env().location_prefix).toEqual('true')
  })
});