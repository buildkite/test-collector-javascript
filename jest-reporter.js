const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const fs = require('fs')
const path = require('path');
const CI = require('./src/ci')

const debug = (text) => {
  if (process.env.BUILDKITE_ANALYTICS_DEBUG_ENABLED === "true") {
    console.log(text)
  }
}

class JestBuildkiteAnalyticsReporter {
  constructor(globalConfig, options) {
    this._buildkiteAnalyticsKey = process.env.BUILDKITE_ANALYTICS_API_TOKEN
    this._globalConfig = globalConfig
    this._options = options
    this._testResults = []
  }

  onRunStart(test) {
  }

  onRunComplete(test, results) {
    if (!this._buildkiteAnalyticsKey) {
      console.error('Missing BUILDKITE_ANALYTICS_API_TOKEN')
      return
    }

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

    debug(`Posting to Test Analytics: ${JSON.stringify(data)}`)

    axios.post('https://analytics-api.buildkite.com/v1/uploads', data, config)
    .then(function (response) {
      debug(`Test Analytics success response: ${JSON.stringify(response.data)}`)
    })
    .catch(function (error) {
      if (error.response) {
        console.error(`Test Analytics error response: ${error.response.status} ${error.response.statusText} ${JSON.stringify(error.response.data)}`);
      } else {
        console.error(`Test Analytics error: ${error.message}`)
      }
    })
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
      return testResult.failureMessages.join(' ').replace(/\u001b[^m]*?m/g,'')
    }
  }
}

module.exports = JestBuildkiteAnalyticsReporter
