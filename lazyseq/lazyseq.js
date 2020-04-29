
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

  const _flatten = Symbol('flatten')
  const flattened = x => Object.assign(x, { [_flatten]: true })
  const isFlat = x => x[_flatten]
  const flatten = function () {
    fns.push({ [_flatten]: true })
    return this
  }

  const produceResult = (initial) => {
    const result = r([initial], 0)
    return isFlat(result) && Array.isArray(result)
      ? result.flat()
      : result
  }

  const r = (prev, i) => {
    if (i === fns.length) return prev

    const fn = fns[i]

    if (isFlat(fn)) {
      return Array.isArray(prev)
        ? flattened(
          prev.map(p => {
            const result = r(p, i + 1, true)
            return Array.isArray(p)
              ? result.flat()
              : result
          })
        )
        : prev
    } else {
      const result = fn(prev[0])
      if (result === nil) return nil
      return r([result], i + 1)
    }
  }

  const take = n => {
    const iterator = startSequence()

    let results = []
    for (let i = 0; i < n; i++) {
      const next = iterator.next()
      if (next.done) {
        break
      }

      const result = produceResult(next.value)

      if (result !== nil) {
        results = results.concat(result)
      }
    }

    return results
  }
  return {
    map, filter, compact, flatten, take
  }
}

module.exports = LazySeq
