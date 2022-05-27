const Tracer = require('../util/tracer')

beforeEach(() => {
  global.buildkiteTracer = new Tracer()
})