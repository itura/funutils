const { id, repeat } = require('../common')
const { lazyReduce } = require('./common')
const { integers } = require('../generators')

const nil = Symbol('nil')

const defaultReducer = (acc, result) => {
  acc.push(result)
  return acc
}

const defaultInitial = () => []

const LazySeq = (generator = integers, config = {}) => {
  const _generator = Array.isArray(generator)
    ? () => generator.values()
    : generator
  const initial = config.initial || defaultInitial
  const reducer = config.reducer || defaultReducer
  const fs = config.fs || []

  const map = f => {
    return LazySeq(_generator, {
      ...config,
      fs: fs.concat(f)
    })
  }

  const filter = (f) => {
    return LazySeq(_generator, {
      ...config,
      fs: fs.concat((x, uniqDict) => f(x, uniqDict) ? x : nil)
    })
  }

  const compact = () => {
    return filter(x => {
      const emptyArray = !x || x.length === 0
      const zero = x === 0

      return !emptyArray || zero
    })
  }

  const uniq = (f = id) => {
    return filter((x, uniqDict) => {
      const comparisonValue = f(x)
      const key = comparisonValue === null || comparisonValue === undefined ? '' : comparisonValue.toString()
      if (!uniqDict[key] || key.match(/^\[object .*\]$/)) {
        uniqDict[key] = x
        return true
      }
      return false
    })
  }

  const reduce = (reducer, initial) => {
    return LazySeq(_generator, {
      ...config,
      reducer,
      initial: () => initial
    })
  }

  const take = n => {
    const uniqDicts = repeat(fs.length, () => ({}))

    return lazyReduce({
      generator: _generator,
      fs,
      reducer,
      initial,
      result: (fs, next) => fs.reduce(
        (prev, f, i) => prev === nil ? nil : f(prev, uniqDicts[i]),
        next
      )
    })(n)
  }

  return {
    map, filter, compact, uniq, reduce, take
  }
}

module.exports = LazySeq
