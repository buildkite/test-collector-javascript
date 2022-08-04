const requestSpy = require('request-spy')

class Network {
  setup(tracer) {
    requestSpy.spy((error, requestData) => {
      const detail = { method: requestData.method, url: requestData.hostname + requestData.path, lib: 'http' }
      tracer.backfill('http', requestData.requestTime, detail)
    })
  }

  teardown() {
    requestSpy.restore()
  }
}

module.exports = Network