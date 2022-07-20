const failureExpanded = (errors) => {
  return errors.map((failure) => {
    let {stack, ...expanded} = failure
    let expandedArray = Object.keys(expanded).map((key) => {
      return `${key}: ${expanded[key]}`
    })
    return { backtrace: stack.split(/\r?\n/), expanded: expandedArray } // change expanded to be an array, it may work like the example!
  })
}

module.exports = failureExpanded