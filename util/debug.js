class Debug {
  static enabled() {
    return process.env.BUILDKITE_ANALYTICS_DEBUG_ENABLED === "true"
  }

  static log(text) {
    if (this.enabled()) {
      console.log(text)
    }
  }
}

module.exports = Debug
