const requestSpy = require('request-spy')

class Network {
  setup() {
    requestSpy.spy((error, requestData) => {
      const detail = { method: requestData.method, url: requestData.hostname + requestData.path, lib: 'http' }
      this.tracer.backfill('http', requestData.requestTime, detail)
    })
  }

  teardown() {
    requestSpy.restore()
  }
}

module.exports = Network