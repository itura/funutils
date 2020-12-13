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
      fs: fs.concat(x => f(x) ? x : nil)
    })
  }

  const compact = () => {
    return filter(x => {
      const emptyArray = !x || x.length === 0
      const zero = x === 0

      return !emptyArray || zero
    })
  }

  const reduce = (reducer, initial) => {
    return LazySeq(_generator, {
      ...config,
      reducer,
      initial: () => initial
    })
  }

  const take = lazyReduce({
    generator: _generator,
    fs,
    reducer,
    initial,
    result: (fs, next) => fs.reduce(
      (prev, f) => prev === nil ? nil : f(prev),
      next
    )
  })

  return {
    map, filter, compact, reduce, take
  }
}

module.exports = LazySeq
