const path = require('path')

class Paths {
  constructor(config, prefix) {
    this.config = config
    this.prefix = prefix
  }

  relativeTestFilePath(testFilePath) {
    // Based upon https://github.com/facebook/jest/blob/49393d01cdda7dfe75718aa1a6586210fa197c72/packages/jest-reporters/src/relativePath.ts#L11
    const dir = this.config.cwd || this.config.rootDir
    return path.relative(dir, testFilePath)
  }

  prefixTestPath(testFilePath) {
    const relativePath = this.relativeTestFilePath(testFilePath)
    return this.prefix ? path.join(this.prefix, relativePath) : relativePath
  }
}

module.exports = Paths