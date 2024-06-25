const { v4: uuidv4 } = require('uuid')
const CI = require('../util/ci')
const uploadTestResults = require('../util/uploadTestResults')
const Paths = require('../util/paths')

class JestBuildkiteAnalyticsReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig
    this._options = options
    this._testResults = []
    this._testEnv = (new CI()).env();
    this._paths = new Paths(globalConfig, this._testEnv.location_prefix)
  }

  onRunStart(results, options) {
    if (this._globalConfig.forceExit) {
      console.warn(
        `--forceExit could potentially terminate any ongoing processes that ` +
        `are attempting to send test executions to Buildkite. ` +
        `Have you considered using \`--detectOpenHandles\` to detect ` +
        'async operations that kept running after all tests finished?',
      );
    }
  }

  onRunComplete(_test, _results, _options) {
    return uploadTestResults(this._testEnv, this._testResults, this._options)
  }

  onTestStart(test) {
  }

  onTestResult(test, testResult) {
    const prefixedTestPath = this._paths.prefixTestPath(testResult.testFilePath);

    testResult.testResults.forEach((result) => {
      let id = uuidv4()
      this._testResults.push({
        'id': id,
        'scope': result.ancestorTitles.join(' '),
        'name': result.title,
        'location': result.location ? `${prefixedTestPath}:${result.location.line}` : null,
        'file_name': prefixedTestPath,
        'result': this.analyticsResult(result),
        'failure_reason': this.analyticsFailureReason(result),
        'failure_expanded': this.analyticsFailureExpanded(result),
        'history': {
          'section': 'top',
          'start_at': testResult.perfStats.start,
          'end_at': testResult.perfStats.end,
          'duration': result.duration / 1000,
        }

      })
    })
  }


  analyticsResult(testResult) {
    // Jest test statuses:
    // - passed
    // - pending
    // - failed
    // - todo
    //
    // Buildkite Test Analytics execution results:
    // - passed
    // - failed
    // - pending
    // - skipped
    // - unknown
    return {
      passed: 'passed',
      pending: 'pending',
      failed: 'failed',
      todo: 'skipped'
    }[testResult.status]
  }

  analyticsFailureMessages(testResult) {
    if (testResult.status !== 'failed') return []

    // Strip ANSI color codes from messages and split each line
    return testResult.failureMessages.join(' ').replace(/\u001b[^m]*?m/g,'').split("\n")
  }
  
  analyticsFailureReason(testResult) {
    return this.analyticsFailureMessages(testResult)[0]
  }

  analyticsFailureExpanded(testResult) {
    return [
      { 
        expanded: this.analyticsFailureMessages(testResult).splice(1)
      }
    ]
  }
}

module.exports = JestBuildkiteAnalyticsReporter
