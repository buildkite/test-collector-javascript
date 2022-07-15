const Mocha = require('mocha')
// The getMochaID method retrieves the unique ID for a test
const getMochaID = require('mocha/lib/utils').getMochaID

const {
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_PENDING,
} = Mocha.Runner.constants

class MochaBuildkiteAnalyticsReporter {
  constructor(runner) {
    this._indents = 0
    const stats = runner.stats

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
      .once(EVENT_RUN_END, () => {
        this.testRunFinished()
      })
  }

  testStarted(test) {
    console.log('test.__mocha_id__', getMochaID(test))
  }

  testFinished(test, error) {
    console.log('test.__mocha_id__', getMochaID(test))
  }

  testRunFinished() {
  }
}

module.exports = MochaBuildkiteAnalyticsReporter
