const { v4: uuidv4 } = require('uuid')
const CI = require('../util/ci')
const uploadTestResults = require('../util/uploadTestResults')
let testLocations = {}

// Jasmine does not provide the filename when reporting on test cases
// We can retrieve it by looking at the stack and extracting the last spec file we see.
const findLocation = () => {
  const fileRegexp = /at.* \({0,1}(.*|\w*):(.*):\d*/
  const trace = (new Error()).stack.split(/\n/)
  const location = (trace.filter((line) => line.match(/spec\.js/gi))[0] || '')
  const locationArray = location.match(fileRegexp) || []
  return {
    filename: locationArray[1],
    line: locationArray[2]
  }
  return (location.match(fileRegexp) || [])[1]
}

const itFactory = (it) => {
  return function (description, fn, timeout) {
    const spec = it.apply(this, arguments)
    testLocations[spec.id] = findLocation()
    return spec
  }
}

// Ovveride jasmine's it(), fit() and xit() functions to retrieve the spec filename
jasmine.getEnv().it = itFactory(jasmine.getEnv().it);
jasmine.getEnv().xit = itFactory(jasmine.getEnv().xit);
jasmine.getEnv().fit = itFactory(jasmine.getEnv().fit);

class JasmineBuildkiteAnalyticsReporter {
  constructor() {
    this._testResults = []
    this._testEnv = (new CI()).env();
  }

  specStarted(result) {
    setSpecProperty('startAt', performance.now() / 1000)
  }

  specDone(result) {
    result.location = testLocations[result.id]
    const id = uuidv4()
    this._testResults.push({
      'id': id,
      'name': result.fullName,
      'identifier': result.fullName,
      'location': result.location.filename + ':' + result.location.line,
      'file_name': result.location.filename,
      'result': this.analyticsResult(result),
      'failure_reason': (result.failedExpectations[0] || {}).message,
      'failure_expanded': result.failedExpectations,
      'history': {
        'section': 'top',
        'start_at': result.properties.startAt,
        'end_at': performance.now() / 1000,
        'duration': result.duration / 1000,
      }
    })
  }

  jasmineDone(result, done) {
    return uploadTestResults(this._testEnv, this._testResults, done)
  }

  analyticsResult(testResult) {
    // Jasmine test statuses:
    // - passed
    // - pending
    // - failed
    // - disabled
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
      disabled: 'skipped'
    }[testResult.status]
  }
}

module.exports = JasmineBuildkiteAnalyticsReporter