const requestSpy = require('request-spy')

class Network {
  setup() {
    requestSpy.spy((error, requestData) => {
      // TODO: add this data to the current scope
      console.log(requestData)
    })
  }

  teardown() {
    requestSpy.restore()
  }
}

module.exports = Network