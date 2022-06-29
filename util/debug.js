const debug = (text) => {
  if (process.env.BUILDKITE_ANALYTICS_DEBUG_ENABLED === "true") {
    console.log(text)
  }
}

module.exports = debug