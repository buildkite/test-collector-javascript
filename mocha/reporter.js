const { v4: uuidv4 } = require('uuid')
const CI = require('../util/ci')
const Paths = require('../util/paths')
const Mocha = require('mocha')
const Runnable = require('mocha/lib/runnable')
const uploadTestResults = require('../util/uploadTestResults')
const failureExpanded = require('../util/failureExpanded')

const {
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_END,
  EVENT_TEST_PENDING,
} = Mocha.Runner.constants

const {
  STATE_PASSED,
  STATE_PENDING,
  STATE_FAILED,
} = Runnable.constants

class MochaBuildkiteAnalyticsReporter {
  constructor(runner, options) {
    this._options = { token: process.env[`${options.reporterOptions.token_name}`]}
    this._testResults = []
    this._testEnv = (new CI()).env();
    this._paths = new Paths({ cwd: process.cwd() }, this._testEnv.location_prefix)

    runner
      .on(EVENT_TEST_BEGIN, (test) => {
        this.testStarted(test)
      })
      .on(EVENT_TEST_END, (test) => {
        this.testFinished(test)
      })
      .on(EVENT_RUN_END, () => {
        this.testRunFinished()
      })
  }

  testStarted(test) {
    test.testAnalyticsId = uuidv4()
    test.startAt = performance.now() / 1000
  }

  testFinished(test) {
    const failureReason = test.err !== undefined ? test.err.toString() : undefined
    const prefixedTestPath = this._paths.prefixTestPath(this.getRootParentFile(test))

    this._testResults.push({
      'id': test.testAnalyticsId,
      'name': test.title,
      'scope': this.scope(test),
      'file_name': prefixedTestPath,
      'location': prefixedTestPath,
      'result': this.analyticsResult(test.state),
      'failure_reason': failureReason,
      'failure_expanded': failureExpanded(test.err == undefined ? [] : test.err.multiple),
      'history': {
        'section': 'top',
        'start_at': test.startAt,
        'end_at': performance.now() / 1000,
        'duration': test.duration / 1000,
      }
    })
  }

  testRunFinished() {
    uploadTestResults(this._testEnv, this._testResults, this._options)
  }

  analyticsResult(state) {
    // Mocha test statuses:
    // - passed
    // - failed
    // - pending
    //
    // Buildkite Test Analytics execution results:
    // - passed
    // - failed
    // - pending
    // - skipped
    // - unknown
    return {
      [STATE_PASSED]: 'passed',
      [STATE_PENDING]: 'pending',
      [STATE_FAILED]: 'failed',
    }[state]
  }

  scope(test) {
    const titlePath = test.titlePath()
    // titlePath returns an array of the scope + the test title.
    // as the test title is the last array item, we just remove it
    // and then join the rest of the array as a space separated string
    return titlePath.slice(0, titlePath.length - 1).join(' ')
  }

  // Recursively find the root parent, and return the parents file
  // This is required as test.file can be undefined in some tests on cypress
  getRootParentFile(test) {
    if (test.file) {
      return test.file
    }
    if (test.parent) {
      return this.getRootParentFile(test.parent)
    }
    return null
  }
}

module.exports = MochaBuildkiteAnalyticsReporter
