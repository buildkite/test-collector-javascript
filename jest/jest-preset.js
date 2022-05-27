const JestPreset = {
  setupFilesAfterEnv: ['./node_modules/buildkite-collector/src/jest/setup.js']
}

module.exports = JestPreset