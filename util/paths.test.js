const Paths = require("./paths")
const process = require("process")

describe("Paths#prefixTestPath", () => {
  it("returns the relative path when provided an absolute path", () => {
    const testPath = '/path/to/codebase/app/tests/best.test.js'
    const cwd = '/path/to/codebase/app'

    const paths = new Paths({ cwd: cwd})
    expect(paths.prefixTestPath(testPath)).toEqual('tests/best.test.js')
  })

  describe("when a prefix is provided", () => {
    it("adds the prefix to the start of the test path", () => {
      const testPath = '/path/to/codebase/app/tests/best.test.js'
      const cwd = '/path/to/codebase/app'
      const prefix = 'happy-library'
  
      const paths = new Paths({ cwd: cwd }, prefix)
      expect(paths.prefixTestPath(testPath)).toEqual('happy-library/tests/best.test.js')
    })
  })
})