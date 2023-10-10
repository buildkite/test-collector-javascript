import stripAnsi from 'strip-ansi';
const CI = require('../util/ci')
const uploadTestResults = require('../util/uploadTestResults')
const Paths = require('../util/paths')

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
 * @implements {import('@playwright/test/reporter').Reporter}
 */
class PlaywrightBuildkiteAnalyticsReporter {

  constructor(options) {
    this._testResults = [];
    this._testEnv = (new CI()).env();
    this._options = options;
    this._paths = new Paths({ cwd: process.cwd() }, this._testEnv.location_prefix);
  }

  onBegin() { }

  onEnd() {
    return new Promise(resolve => {
      uploadTestResults(this._testEnv, this._testResults, this._options, resolve);
    })
  }

  onTestBegin() { }

  /**
   *
   * @param {TestCase} test
   * @param {TestResult} testResult
   */
  onTestEnd(test, testResult) {
    const scope = test.titlePath().join(' ');
    const fileName = this._paths.prefixTestPath(test.location.file);
    const location = [fileName, test.location.line, test.location.column].join(':');

    this._testResults.push({
      'id': test.id,
      'name': test.title,
      'scope': scope,
      'location': location,
      'file_name': fileName,
      'result': this.analyticsResult(testResult.status),
      'failure_reason': this.analyticsFailureReason(testResult),
      'failure_expanded': this.analyticsFailureExpanded(testResult),
      'history': {
        'section': 'top',
        'start_at': testResult.startTime.getTime(),
        'duration': testResult.duration / 1000,
      }
    });
  }

  analyticsResult(status) {
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
    }[status]
  }

  /**
   *
   * @param {TestResult} testResult
   */
  analyticsFailureMessages(testResult) {
    if (testResult.error == undefined) return [];

    const stack = stripAnsi(testResult.error.stack).split("\n");
    const snippet = stripAnsi(testResult.error.snippet).split("\n");

    return stack.concat(snippet);
  }

  /**
   *
   * @param {TestResult} testResult
   */
  analyticsFailureReason(testResult) {
    return this.analyticsFailureMessages(testResult)[0];
  }

  /**
   *
   * @param {TestResult} testResult
   */
  analyticsFailureExpanded(testResult) {
    return [
      {
        expanded: this.analyticsFailureMessages(testResult).splice(1)
      }
    ];
  }
}

module.exports = PlaywrightBuildkiteAnalyticsReporter
