const stripAnsi = require('strip-ansi');
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
 * A playwright reporter that uploads test results to Buildkite Test Engine
 *
 * @implements {import('@playwright/test/reporter').Reporter}
 */
class PlaywrightBuildkiteTestEngineReporter {

  constructor(options) {
    this._testResults = [];
    this._testEnv = (new CI()).env('playwright');
    this._tags = options?.tags;
    this._options = options;
    this._paths = new Paths({ cwd: process.cwd() }, this._testEnv.location_prefix);
    this._tagPattern = /^@[^:]+:[^:]+$/;
    this._annotationTagPrefix = 'buildkite.tag.';
    this._usedDeprecatedTags = false;
  }

  onBegin() { }

  onEnd() {
    if (this._usedDeprecatedTags) {
      console.warn('[buildkite-test-collector] Playwright `tag` (e.g. "@key:value") is deprecated for tagging tests.');
      console.warn('[buildkite-test-collector] Use an `annotation` with a `buildkite.tag.` prefix instead, e.g. `buildkite.tag.team`.');
    }

    return new Promise(resolve => {
      uploadTestResults(this._testEnv, this._tags, this._testResults, this._options, resolve);
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

    const tags = {
      ...this.tagsFromTags(test),
      ...this.tagsFromAnnotations(test)
    };

    this._testResults.push({
      'id': test.id,
      'name': test.title,
      'scope': scope,
      'location': location,
      'file_name': fileName,
      'result': this.testEngineResult(testResult.status),
      'failure_reason': this.testEngineFailureReason(testResult),
      'failure_expanded': this.testEngineFailureExpanded(testResult),
      'history': {
        'section': 'top',
        'start_at': testResult.startTime.getTime(),
        'duration': testResult.duration / 1000,
      },
      'tags': tags
    });
  }

  /**
   * @deprecated Tagging via Playwright's `tag` option (`@key:value`) is deprecated.
   * Use an `annotation` with a `buildkite.tag.` prefix instead, e.g.
   * `{ annotation: { type: "buildkite.tag.team", description: "my-team" } }`.
   *
   * @param {TestCase} test
   */
  tagsFromTags(test) {
    const filteredTags = (test.tags || []).filter(tag => this._tagPattern.test(tag));

    if (filteredTags.length > 0) {
      this._usedDeprecatedTags = true;
    }

    return filteredTags.reduce((acc, tag) => {
      const [key, value] = tag.slice(1).split(':');
      acc[key] = value;

      return acc;
    }, {});
  }

  /**
   * @param {TestCase} test
   */
  tagsFromAnnotations(test) {
    return (test.annotations || []).reduce((acc, annotation) => {
      if (!annotation.type.startsWith(this._annotationTagPrefix)) return acc;

      const key = annotation.type.slice(this._annotationTagPrefix.length);
      acc[key] = annotation.description;

      return acc;
    }, {});
  }

  testEngineResult(status) {
    // Playwright test statuses:
    // - failed
    // - interrupted
    // - passed
    // - skipped
    // - timedOut
    //
    // Buildkite Test Engine execution results:
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
  testEngineFailureReason(testResult) {
    if (testResult.error == undefined) return "";

    const reason = stripAnsi(testResult.error.message).split("\n")[0];

    return reason;
  }

  /**
   *
   * @param {TestResult} testResult
   */
  testEngineFailureExpanded(testResult) {
    let expandedErrors = [];

    if (testResult.errors) {
      for (const error of testResult.errors) {
        if (error.stack) {
          const stack = stripAnsi(error.stack).split("\n");
          const snippet = stripAnsi(error.snippet)?.split("\n") || [];
          expandedErrors = expandedErrors.concat(stack, snippet);
        } else if (error.message) {
          const message = stripAnsi(error.message).split("\n");
          expandedErrors = expandedErrors.concat(message);
        }
      }
    }

    return [
      {
        expanded: expandedErrors
      }
    ];
  }
}

module.exports = PlaywrightBuildkiteTestEngineReporter
