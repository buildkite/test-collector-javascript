const Debug = require('../util/debug')
const axios = require('axios')

const CHUNK_SIZE = 5000
const DEFAULT_BUILDKITE_ANALYTICS_BASE_URL = 'https://analytics-api.buildkite.com/v1/uploads'

const uploadTestResults = (env, results, options, done) => {
  const buildkiteAnalyticsToken = options?.token || process.env.BUILDKITE_ANALYTICS_TOKEN
  const buildkiteAnalyticsUrl = options?.url || process.env.BUILDKITE_ANALYTICS_BASE_URL || DEFAULT_BUILDKITE_ANALYTICS_BASE_URL

  if (!buildkiteAnalyticsToken) {
    console.error('Missing BUILDKITE_ANALYTICS_TOKEN')

    if (done !== undefined) { return done() }
    return
  }

  const config = {
    headers: {
      'Authorization': `Token token="${buildkiteAnalyticsToken}"`,
      'Content-Type': 'application/json'
    }
  }

  const requests = [];

  if (Debug.enabled()) {
    axios.interceptors.request.use(function (config) {
      Debug.log(`Test Analytics Sending: ${JSON.stringify(config)}`);
      return config;
    }, function (error) {
      if (error.response) {
        Debug.log(`Test Analytics request error: ${error.response.status} ${error.response.statusText} ${JSON.stringify(error.response.data)}`);
      } else {
        Debug.log(`Test Analytics request error: ${error.message}`)
      }
      // Do something with request error
      return Promise.reject(error);
    });
  }

  // Add a response interceptor
  axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    Debug.log(`Test Analytics success response ${JSON.stringify(response.data)}`);
    return response;
  }, function (error) {
    if (error.response) {
      console.log(`⚠️ Test Analytics error response: ${error.response.status} ${error.response.statusText} ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`⚠️ Test Analytics error: ${error.message}`)
    }
    return Promise.reject(error);
  });

  for (let i = 0; i < results.length; i += CHUNK_SIZE) {
    const data = {
      'format': 'json',
      'run_env': env,
      "data": results.slice(i, i + CHUNK_SIZE),
    }

    requests.push(axios.post(buildkiteAnalyticsUrl, data, config))
  }

  return Promise.allSettled(requests)
    .finally(function (responses) {
      if (done !== undefined) { return done() }
    })
}

module.exports = uploadTestResults
