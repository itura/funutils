
const LazySeq = (startSequence, monad) => {
  const fns = []

  const map = function (fn) {
    fns.push(fn)
    return this
  }

  const nil = Symbol('nil')
  const filter = function (fn) {
    fns.push(x => fn(x) ? x : nil)
    return this
  }

  const compact = function () {
    filter(x => {
      const emptyArray = !x || x.length === 0
      const zero = x === 0

      return !emptyArray || zero
    })
    return this
  }

  const take = n => {
    const iterator = startSequence()

    const results = []
    for (let i = 0; i < n; i++) {
      const next = iterator.next()
      if (next.done) {
        break
      }

      const result = fns.reduce(
        (prev, fn) => prev === nil ? nil : fn(prev),
        next.value
      )

      if (result !== nil) {
        results.push(result)
      }
    }

    return results
  }
  return {
    map, filter, compact, take
  }
}

module.exports = LazySeq
