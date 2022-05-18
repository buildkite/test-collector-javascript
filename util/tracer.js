class Span {
  constructor(section) {
    this.section = section
    this.startAt = performance.now()
  }

  duration() {
    return this.endAt - this.startAt
  }
}

class Tracer {
  constructor() {
    this.top = new Span('top')
    this.stack = [this.top]
  }

  finalize() {
    if(this.stack.length != 1) {
      throw new Error("Stack not empty")
    }

    this.top.endAt = performance.now()
  }
}

module.exports = Tracer