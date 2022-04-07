const { v4: uuidv4 } = require('uuid')

class CI {
  // the analytics env are more specific than the automatic ci platform env.
  // If they've been specified we'll assume the user wants to use that value instead.
  env() {
    return({
      ...this.ci_env(),
      ...this.analytics_env()
    })
  }

  _stripUndefinedKeys(object) {
    Object.keys(object).forEach((key) => {
      if (object[key] === undefined) {
        delete object[key]
      }
    })
  }

  ci_env() {
    if(process.env.BUILDKITE_BUILD_ID !== undefined) { return(this.buildkite()) }
    if(process.env.GITHUB_RUN_NUMBER !== undefined) { return(this.github_actions()) }
    if(process.env.CIRCLE_BUILD_NUM  !== undefined) { return(this.circleci()) }
    if(process.env.CI !== undefined) { return(this.generic()) }

    return({
      'CI': undefined,
      'key': uuidv4()
    })
  }

  analytics_env() {
    return this._stripUndefinedKeys({
      "key": process.env.BUILDKITE_ANALYTICS_KEY,
      "url": process.env.BUILDKITE_ANALYTICS_URL,
      "branch": process.env.BUILDKITE_ANALYTICS_BRANCH,
      "commit_sha": process.env.BUILDKITE_ANALYTICS_SHA,
      "number": process.env.BUILDKITE_ANALYTICS_NUMBER,
      "job_id": process.env.BUILDKITE_ANALYTICS_JOB_ID,
      "message": process.env.BUILDKITE_ANANLYTICS_MESSAGE,
      "debug": process.env.BUILDKITE_ANALYTICS_DEBUG_ENABLED,
      "version": "0.0.1", // TODO: point to a VARIABLE constant
      "collector": "js-buildkite-analytics", // TODO: tweak this name
    })
  }

  generic() {
    return({
      "CI": "generic",
      "key": uuidv4(),
    })
  }

  buildkite() {
    return({
      "ci": "buildkite",
      "key": process.env.BUILDKITE_BUILD_ID,
      "url": process.env.BUILDKITE_BUILD_URL,
      "branch": process.env.BUILDKITE_BRANCH,
      "commit_sha": process.env.BUILDKITE_COMMIT,
      "number": process.env.BUILDKITE_BUILD_NUMBER,
      "job_id": process.env.BUILDKITE_JOB_ID,
      "message": process.env.BUILDKITE_MESSAGE,
    })
  }

  github_actions() {
    return({
      "ci": "github_actions",
      "key": `${process.env.GITHUB_ACTION}-${process.env.GITHUB_RUN_NUMBER}-${process.env.GITHUB_RUN_ATTEMPT}`,
      "url": `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
      "branch": process.env.GITHUB_REF,
      "commit_sha": process.env.GITHUB_SHA,
      "number": process.env.GITHUB_RUN_NUMBER,
    })
  }

  circleci() {
    return({
      "ci": "circleci",
      "key": `${process.env.CIRCLE_WORKFLOW_ID}-${process.env.CIRCLE_BUILD_NUM}`,
      "url": process.env.CIRCLE_BUILD_URL,
      "branch": process.env.CIRCLE_BRANCH,
      "commit_sha": process.env.CIRCLE_SHA1,
      "number": process.env.CIRCLE_BUILD_NUM,
    })
  }
}

module.exports = CI