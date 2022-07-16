const CI = require('../util/ci')
const Paths = require('../util/paths')
const Mocha = require('mocha')
const Runnable = require('mocha/lib/runnable')
const uploadTestResults = require('../util/uploadTestResults')
// The getMochaID method retrieves the unique ID for a test
const getMochaID = require('mocha/lib/utils').getMochaID

const {
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_PENDING,
} = Mocha.Runner.constants

const {
  STATE_PASSED,
  STATE_PENDING,
  STATE_FAILED,
} = Runnable.constants

class MochaBuildkiteAnalyticsReporter {
  constructor(runner) {
    this._testResults = []
    this._testEnv = (new CI()).env();
    this._paths = new Paths({ cwd: process.cwd() }, this._testEnv.location_prefix)

    runner
      .on(EVENT_TEST_BEGIN, (test) => {
        this.testStarted(test)
      })
      .on(EVENT_TEST_PASS, (test) => {
        this.testFinished(test)
      })
      .on(EVENT_TEST_FAIL, (test, error) => {
        this.testFinished(test, error)
      })
      .on(EVENT_RUN_END, () => {
        this.testRunFinished()
      })
  }

  testStarted(test) {
  }

  testFinished(test, error) {
    const failureReason = undefined
    if(error !== undefined) {
      // FIXME: We need to retreive the simple error message
      // failureReason = JSON.stringify(error)
    }

    const prefixedTestPath = this._paths.prefixTestPath(test.file)

    this._testResults.push({
      'id': getMochaID(test),
      'name': test.title,
      'identifier': test.parent.title.length > 0 ? `${test.parent.title} ${test.title}` : test.title, // FIXME: needs to be recursive, as we could have many parents
      'file_name': prefixedTestPath,
      'result': this.analyticsResult(test.state),
      'failure_reason': failureReason
    })
  }

  testRunFinished() {
    uploadTestResults(this._testEnv, this._testResults)
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
}

module.exports = MochaBuildkiteAnalyticsReporter
