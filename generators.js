
const _zip = function * (combo, ...xss) {
  if (xss.length === 1) {
    for (const x of xss[0]) {
      yield combo.concat(x)
    }
  } else {
    for (const x of xss[0]) {
      yield * _zip(combo.concat(x), ...xss.slice(1))
    }
  }
}

const zip = function * (...xss) {
  if (xss.length === 0) {
    return
  }
  if (xss.length === 1) {
    yield xss[0]
    return
  }

  yield * _zip([], ...xss)
}

const integers = function * (options = {}) {
  const start = Math.floor(options.start) || 0
  const step = Math.floor(options.step) || 1
  const stop = Math.floor(options.stop) || Infinity

  if (step < 0) return

  let i = start
  while (true) {
    if (i < stop) {
      yield i
    } else {
      return
    }
    i += step
  }
}

module.exports = { zip, integers }
