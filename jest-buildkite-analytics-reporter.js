const { v4: uuidv4 } = require('uuid')
const axios = require('axios')


const fs = require('fs');

// FIXME: currently used for debugging, please remove :)
const log = (text) => {
  fs.appendFile('buildkite-analytics.log', text + "\n", () => {})
}

class JestBuildkiteAnalyticsReporter {
  constructor(globalConfig, options) {
    this._buildkiteAnalyticsKey = process.env.BUILDKITE_ANALYTICS_KEY

    this._globalConfig = globalConfig
    this._options = options
  }

  onRunStart(test) {
    process.stdout.write('STARTING')

    uuidv4() 
    log('start')
  }

  onRunComplete(test, results) {
    log('complete')
    const {
        numFailedTests,
        numPassedTests,
        numTodoTests,
        numPendingTests,
        testResults,
        numTotalTests,
        startTime
    } = results
  }

  onTestStart(test) {
    log('test start')
  }

  onTestResult(test, testResult, results) {
    log('test result')
  }
}

module.exports = JestBuildkiteAnalyticsReporter