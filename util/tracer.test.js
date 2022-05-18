const Tracer = require('./../src/tracer');

describe('Tracer()', () => {
  test('creates a top level span', () => {
    const tracer = new Tracer()

    expect(tracer.stack.length).toEqual(1)
  })

  test('sets a start time for the top level span', () => {
    const tracer = new Tracer()

    expect(tracer.stack[0].startAt).toBeDefined()
  })
})

describe('Tracer.finalize()', () => {
  test('sets the duration for the span', () => {
    const tracer = new Tracer()
    tracer.finalize()

    expect(tracer.stack[0].duration()).toBeDefined()
  })
})