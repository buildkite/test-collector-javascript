let filenames = {}

const findLocation = () => {
  const fileRegexp = /at.* \({0,1}(.*|\w*):(.*):\d*/
  const trace = (new Error()).stack.split(/\n/)
  const location = (trace.filter((line) => line.match(/spec\.js/gi))[0] || '')
  return (location.match(fileRegexp) || [])[1]
}

const itFactory = (it) => {
  return function (description, fn, timeout) {
    const spec = it.apply(this, arguments)
    filenames[spec.id] = findLocation()
    return spec
  }
}

// Ovveride jasmine's it() function to retrieve the spec filename
jasmine.getEnv().it = itFactory(jasmine.getEnv().it);

class JasmineBuildkiteAnalyticsReporter {
  specStarted(result) {
    // console.log('result', result)
  }

  specDone(result) {
    let filename = filenames[result.id]
    // console.log('result', result)
  }
}

module.exports = JasmineBuildkiteAnalyticsReporter