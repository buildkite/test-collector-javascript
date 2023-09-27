const CI = require('../util/ci')
const uploadTestResults = require('../util/uploadTestResults')

/**
 * JSDoc Imports
 *
 * @typedef {import('@playwright/test/reporter').FullConfig} FullConfig
 * @typedef {import('@playwright/test/reporter').FullResult} FullResult
 * @typedef {import('@playwright/test/reporter').Reporter} Reporter
 * @typedef {import('@playwright/test/reporter').Suite} Suite
 * @typedef {import('@playwright/test/reporter').TestCase} TestCase
 * @typedef {import('@playwright/test/reporter').TestResult} TestResult
 */

/**
 * A playwright reporter that uploads test results to Buildkite Test Analytics
 *
 * @typedef {Reporter}
 */
class PlaywrightBuildkiteAnalyticsReporter {

  constructor() {
    this._testResults = []
    this._testEnv = (new CI()).env();
  }
  
  onBegin() {}

  onEnd() {
    uploadTestResults(this._testEnv, this._testResults)
  }

  onTestBegin() {}

  /**
   *
   * @param {TestCase} test
   * @param {TestResult} testResult
   */
  onTestEnd(test, testResult) {
    this._testResults.push({
      'id': test.id,
      'scope': test.titlePath.join(' '),
      'name': test.title,
      'location': test.location,
      'file_name': test.location,
      'result': this.analyticsResult(testResult.status),
      'failure_reason': testResult.error,
      'failure_expanded': testResult.errors,
      'history': {
        'section': 'top',
        'start_at': testResult.startTime,
        'duration': testResult.duration / 1000,
      }
    })
  }


  analyticsResult(testResult) {
    // Playwright test statuses:
    // - failed
    // - interrupted
    // - passed
    // - skipped
    // - timedOut
    //
    // Buildkite Test Analytics execution results:
    // - failed
    // - passed
    // - pending
    // - skipped
    // - unknown
    return {
      failed: 'failed',
      interrupted: 'unknown',
      passed: 'passed',
      skipped: 'skipped',
      timedOut: 'failed',
    }[testResult.status]
  }
}

module.exports = PlaywrightBuildkiteAnalyticsReporter
