const failureExpanded = (errors) => {
  return errors.map((failure) => {
    let {stack, ...expanded} = failure
    let expandedArray = Object.keys(expanded).map((key) => {
      return `${key}: ${expanded[key]}`
    })
    return { backtrace: stack.split(/\r?\n/), expanded: expandedArray }
  })
}

module.exports = failureExpanded