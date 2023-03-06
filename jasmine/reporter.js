const { v4: uuidv4 } = require('uuid')
const CI = require('../util/ci')
const failureExpanded = require('../util/failureExpanded')
const uploadTestResults = require('../util/uploadTestResults')
const Paths = require('../util/paths')
const Tracer = require('../util/tracer')
const Network = require('../util/network')
const process = require('node:process')
const { traceDeprecation } = require('node:process')
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
  constructor(config = { cwd: process.cwd() }, options) {
    this.config = config
    this._options = options
    this._testResults = []
    this._testEnv = (new CI()).env();
    this._paths = new Paths(config, this._testEnv.location_prefix)
  }

  specStarted(result) {
    let network = new Network()
    let tracer = new Tracer()
    network.setup(tracer)

    setSpecProperty('startAt', performance.now() / 1000)
    setSpecProperty('tracer', tracer)
    setSpecProperty('network', network)
  }

  specDone(result) {
    result.properties.tracer.finalize()
    result.properties.network.teardown()

    result.location = testLocations[result.id]
    const prefixedTestPath = this._paths.prefixTestPath(result.location.filename);

    const id = uuidv4()
    this._testResults.push({
      'id': id,
      'name': result.description,
      'location': result.location ? `${prefixedTestPath}:${result.location.line}` : null,
      'file_name': prefixedTestPath,
      'result': this.analyticsResult(result),
      'failure_reason': (result.failedExpectations[0] || {}).message,
      'failure_expanded': failureExpanded(result.failedExpectations),
      'history': result.properties.tracer.history(),
    })
  }

  jasmineDone(result, done) {
    return uploadTestResults(this._testEnv, this._testResults, this._options, done)
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