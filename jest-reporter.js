const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const fs = require('fs')
const path = require('path');
const CI = require('./src/ci')

class JestBuildkiteAnalyticsReporter {
  constructor(globalConfig, options) {
    this._buildkiteAnalyticsKey = process.env.BUILDKITE_ANALYTICS_KEY
    this._globalConfig = globalConfig
    this._options = options
    this._testResults = []
    this.debugEnabled = !!process.env.BUILDKITE_ANALYTICS_DEBUG_ENABLED
    this.debugFilepath = process.env.BUILDKITE_ANALYTICS_DEBUG_FILEPATH || (process.cwd() + '/buildkite-analytics.log')
  }

  log(message) {
    if(this.debugEnabled) {
      fs.appendFile(this.debugFilepath, message + "\n", () => { })
    }
  }

  onRunStart(test) {
  }

  onRunComplete(test, results) {
    let data = {
      'format': 'json',
      'run_env': (new CI()).env(),
      "data": this._testResults,
    }
    let config = {
      headers: {
        'Authorization': `Token token="${this._buildkiteAnalyticsKey}"`,
        'Content-Type': 'application/json'
      }
    }

    axios.post('https://analytics-api.buildkite.com/v1/uploads', data, config)
    .then(function (response) {
      this.log('Analytics successfully uploaded to Buildkite')
    }.bind(this))
    .catch(function (error) {
      if (error.response) {
        this.log(`Error, response: ${error.response.status} ${error.response.statusText} ${JSON.stringify(error.response.data)}`);
      } else {
        this.log(`Error, ${error.message}`)
      }
    }.bind(this))
  }

  onTestStart(test) {
  }

  onTestResult(test, testResult) {
    const testPath = this.relativeTestFilePath(testResult.testFilePath)

    testResult.testResults.forEach((result) => {
      let id = uuidv4()
      this._testResults.push({
        'id': id,
        'scope': result.ancestorTitles.join(' '),
        'name': result.title,
        'identifier': result.fullName,
        'location': result.location ? `${testPath}:${result.location.line}` : null,
        'file_name': testPath,
        'result': this.analyticsResult(result),
        'failure_reason': this.analyticsFailureReason(result),
        // TODO: Add support for 'failure_expanded'
        'history': {
          'section': 'top',
          'start_at': testResult.perfStats.start,
          'end_at': testResult.perfStats.end,
          'duration': result.duration / 1000,
        }

      })
    })
  }

  relativeTestFilePath(testFilePath) {
    // Based upon https://github.com/facebook/jest/blob/49393d01cdda7dfe75718aa1a6586210fa197c72/packages/jest-reporters/src/relativePath.ts#L11
    const dir = this._globalConfig.cwd || this._globalConfig.rootDir
    return path.relative(dir, testFilePath)
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

  analyticsFailureReason(testResult) {
    if (testResult.status === 'failed') {
      // Strip ANSI color codes from messages
      return result.failureMessages.join(' ').replace(/\u001b[^m]*?m/g,'')
    }
  }
}

module.exports = JestBuildkiteAnalyticsReporter