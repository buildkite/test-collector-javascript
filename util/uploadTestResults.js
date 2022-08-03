const debug = require('../util/debug')
const axios = require('axios')
const CHUNK_SIZE = 5000

const uploadTestResults = (env, results, done) => {
  const buildkiteAnalyticsToken = process.env.BUILDKITE_ANALYTICS_TOKEN
  let data

  if (!buildkiteAnalyticsToken) {
    console.error('Missing BUILDKITE_ANALYTICS_TOKEN')
    return
  }

  const config = {
    headers: {
      'Authorization': `Token token="${buildkiteAnalyticsToken}"`,
      'Content-Type': 'application/json'
    }
  }

  for (let i=0; i < results.length; i += CHUNK_SIZE) {
    data = {
      'format': 'json',
      'run_env': env,
      "data": results.slice(i, i + CHUNK_SIZE),
    }

    debug(`Posting to Test Analytics: ${JSON.stringify(data)}`)

    axios.post('https://analytics-api.buildkite.com/v1/uploads', data, config)
    .then(function (response) {
      debug(`Test Analytics success response: ${JSON.stringify(response.data)}`)
      if(done !== undefined) { return done() }
    })
    .catch(function (error) {
      if (error.response) {
        console.error(`Test Analytics error response: ${error.response.status} ${error.response.statusText} ${JSON.stringify(error.response.data)}`);
      } else {
        console.error(`Test Analytics error: ${error.message}`)
      }
      if(done !== undefined) { return done() }
    })
  }
}

module.exports = uploadTestResults