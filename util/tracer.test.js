const Tracer = require('./tracer');

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

    expect(tracer.stack[0].duration).toBeDefined()
  })

  test('throws an exception when there are multiple unfinished spans', () => {
    const tracer = new Tracer()
    tracer.stack.push({})

    expect(tracer.finalize.bind(tracer)).toThrowError(/Stack not empty/)
  })
})

describe('Tracer.backfill()', () => {
  test('inserts new spans into the stack', () => {
    const tracer = new Tracer()
    tracer.backfill('http', 500, { extra: 'detail' })

    expect(tracer.stack[0].children[0].section).toEqual('http')
    expect(tracer.stack[0].children[0].detail).toEqual({extra: 'detail'})
    expect(tracer.stack[0].children[0].duration).toBeCloseTo(0.5, 1)
  })
})

describe('Tracer.history()', () => {
  let originalGlobalPerformance

  beforeEach(() => {
    originalGlobalPerformance = global.performance
    global.performance = {now: () => 11000}
  })

  afterEach(() => {
    if (originalGlobalPerformance) {
      global.performance = originalGlobalPerformance
    }
  })

  test('returns all of the traces', () => {
    const tracer = new Tracer()
    tracer.backfill('sql', 3000, { kind: 'INSERT' })
    tracer.finalize()

    expect(tracer.history()).toEqual({
      section: 'top',
      start_at: 11,
      end_at: 11,
      duration: 0,
      detail: {},
      children: [
        {
          section: 'sql',
          start_at: 8,
          end_at: 11,
          duration: 3,
          detail: { kind: 'INSERT'},
          children: []
        }
      ]
    })
  })
})