const { lazyReduce } = require('./common')
const { integers } = require('../generators')

const nil = Symbol('nil')

const nilCaseMap = (x, cases) =>
  x === nil
    ? cases.nil
    : cases.just(x)

const defaultReducer = (acc, result) => nilCaseMap(result, {
  nil: acc,
  just: x => acc.concat(x)
})

const defaultInitial = () => []

const LazySeq = (generator = integers, config = {}) => {
  const initial = config.initial || defaultInitial
  const reducer = config.reducer || defaultReducer
  const fs = config.fs || []

  const map = (f) => {
    return LazySeq(generator, {
      ...config,
      fs: fs.concat(f)
    })
  }

  const filter = (f) => {
    return LazySeq(generator, {
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
    return LazySeq(generator, {
      ...config,
      reducer,
      initial: () => initial
    })
  }

  const take = lazyReduce({
    generator,
    fs,
    reducer,
    initial,
    result: (fs, next) => fs.reduce(
      (prev, f) => nilCaseMap(prev, {
        nil: nil,
        just: x => f(x)
      }),
      next
    )
  })

  return {
    map, filter, compact, reduce, take
  }
}

module.exports = LazySeq
