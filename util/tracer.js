class Span {
  constructor(section, startAt, endAt, detail = {}) {
    this.section = section
    this.startAt = startAt
    this.endAt = endAt
    this.detail = detail
    this.children = []
  }

  get duration() {
    return (this.endAt - this.startAt)
  }

  toJSON() {
    return {
      section: this.section,
      start_at: this.startAt,
      end_at: this.endAt,
      duration: this.duration,
      detail: this.detail,
      children: this.children.map((child) => child.toJSON())
    }
  }
}

class Tracer {
  constructor() {
    this.top = new Span('top', performance.now() / 1000)
    this.stack = [this.top]
  }

  finalize() {
    if(this.stack.length != 1) {
      throw new Error("Stack not empty")
    }

    this.top.endAt = (performance.now() / 1000)
  }

  backfill(section, duration, detail) {
    const newEntry = new Span(section, (performance.now() - duration) / 1000, performance.now() / 1000, detail)
    this.currentSpan().children.push(newEntry)
  }

  currentSpan() {
    return this.stack.slice(-1)[0]
  }

  history() {
    return this.top.toJSON()
  }
}

module.exports = Tracer