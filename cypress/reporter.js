const MochaBuildkiteAnalyticsReporter = require('../mocha/reporter')
const failureExpanded = require('../util/failureExpanded')

// Cypress uses mocha under the hood for assertions, so there is some overlap
// between this reporter and the mocha reporter. They differ in how they
// report errors.
class CypressBuildkiteAnalyticsReporter extends MochaBuildkiteAnalyticsReporter {
  constructor(runner, options) {
    super(runner, options)
  }

  testFinished(test) {
    const prefixedTestPath = this._paths.prefixTestPath(this.getRootParentFile(test))

    const { failureReason, failureExpanded } = this.getFailureReason(test.err)

    const result = {
      'id': test.testAnalyticsId,
      'name': test.title,
      'scope': this.scope(test),
      'identifier': test.fullTitle(),
      'file_name': prefixedTestPath,
      'location': prefixedTestPath,
      'result': this.analyticsResult(test.state),
      'failure_reason': failureReason,
      'failure_expanded': failureExpanded,
      'history': {
        'section': 'top',
        'start_at': test.startAt,
        'end_at': performance.now() / 1000,
        'duration': test.duration / 1000,
      }
    }

    this._testResults.push(result)
  }

  getFailureReason(err) {
    if (err === undefined) {
      return {
        failureReason: undefined,
        failureExpanded: [],
      }
    }

    return {
      failureReason: err.message,
      failureExpanded: failureExpanded([err]),
    }
  }
}

module.exports = CypressBuildkiteAnalyticsReporter
