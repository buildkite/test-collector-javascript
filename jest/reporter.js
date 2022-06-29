const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const fs = require('fs')
const path = require('path');
const CI = require('../util/ci')
const Network = require('../util/network')
const Tracer = require('../util/tracer')
const CHUNK_SIZE = 5000

const debug = (text) => {
  if (process.env.BUILDKITE_ANALYTICS_DEBUG_ENABLED === "true") {
    console.log(text)
  }
}

class JestBuildkiteAnalyticsReporter {
  constructor(globalConfig, options) {
    this._buildkiteAnalyticsToken = process.env.BUILDKITE_ANALYTICS_TOKEN
    this._globalConfig = globalConfig
    this._options = options
    this._testResults = []
    this._testEnv = (new CI()).env();
  }

  onRunComplete(_test, _results) {
    if (!this._buildkiteAnalyticsToken) {
      console.error('Missing BUILDKITE_ANALYTICS_TOKEN')
      return
    }

    for (let i=0; i < this._testResults.length; i += CHUNK_SIZE) {
      this.uploadTestResults(this._testResults.slice(i, i + 5000))
    }
  }

  uploadTestResults(results) {
    if (!this._buildkiteAnalyticsToken) {
      console.error('Missing BUILDKITE_ANALYTICS_TOKEN')
      return
    }

    let data = {
      'format': 'json',
      'run_env': this._testEnv,
      "data": results,
    }
    let config = {
      headers: {
        'Authorization': `Token token="${this._buildkiteAnalyticsToken}"`,
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

  onTestFileStart(test) {
    console.log('FILE START')
    let testEnv = test.context.config.globals

    testEnv.tracer = new Tracer()
    testEnv.network = new Network()
    testEnv.network.setup(testEnv.tracer)
    testEnv.results = []
  }

  onTestCaseResult(test, result) {
    let testEnv = test.context.config.globals
    testEnv.tracer.finalize()

    testEnv.results.push({
      'id': uuidv4(),
      'scope': result.ancestorTitles.join(' '),
      'name': result.title,
      'identifier': result.fullName,
      'result': this.analyticsResult(result),
      'failure_reason': this.analyticsFailureReason(result),
      // TODO: Add support for 'failure_expanded'
      'history': testEnv.tracer.history(),
    })

    // Jest does not have a hook for an individual test case starting, so use this as a pseudo before-each hook
    // We setup a tracer for the next test if there is one
    testEnv.tracer = new Tracer()
    testEnv.network = new Network()
    testEnv.network.setup(testEnv.tracer)
  }

  onTestFileResult(test, result) {
    let testEnv = test.context.config.globals
    // result.testFilePath is only available after the test file has run, otherwise we would push the test result in the 'onTestCaseResult' hook
    const testPath = this.relativeTestFilePath(result.testFilePath);
    const prefixedTestPath = this.prefixTestPath(testPath);

    this._testResults.push(...testEnv.results.map((testResult) => {
      return {
        location: result.location ? `${prefixedTestPath}:${result.location.line}` : null,
        file_name: result.file_name = prefixedTestPath,
        ...testResult
      }
    }))
  }

  prefixTestPath(testFilePath) {
    const prefix = this._testEnv.location_prefix
    return prefix ? path.join(prefix, testFilePath) : testFilePath
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
