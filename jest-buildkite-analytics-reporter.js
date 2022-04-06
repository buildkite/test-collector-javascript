
class JestBuildkiteAnalyticsReporter {
  constructor(globalConfig, options) {
    this._buildkiteAnalyticsKey = process.env.BUILDKITE_ANALYTICS_KEY

    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunStart(test) {
    console.log('start')
  }

  onRunComplete(test, results) {
    console.log('complete')
    const {
        numFailedTests,
        numPassedTests,
        numTodoTests,
        numPendingTests,
        testResults,
        numTotalTests,
        startTime
    } = results;
  }

  onTestStart(test) {
    console.log('test start')
  }

  onTestResult(test, testResult, results) {
    console.log('test result')
  }
}

module.exports = JestBuildkiteAnalyticsReporter;