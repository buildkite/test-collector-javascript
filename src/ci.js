const { v4: uuidv4 } = require('uuid')
const { name, version } = require('.././package.json')

class CI {
  env() {
    return({
      "version": version,
      "collector": `js-${name}`,      
      ...this.ci_env()
    })
  }

  ci_env() {
    if (process.env.BUILDKITE_BUILD_ID !== undefined) {
      return(this.buildkite())
    } else if (process.env.GITHUB_RUN_NUMBER !== undefined) {
      return(this.github_actions())
    } else if (process.env.CIRCLE_BUILD_NUM  !== undefined) {
      return(this.circleci())
    } else {
      return(this.generic())
    }
  }

  generic() {
    return({
      "ci": "generic",
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