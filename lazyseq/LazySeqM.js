const { chainM } = require('../common')
const { lazyReduce } = require('./common')
const { integers } = require('../generators')

const defaultReducer = (results, result) => {
  results.push(result)
  return results
}

const defaultInitial = () => []

const LazySeqM = (monad, generator = integers, config = {}) => {
  const _generator = Array.isArray(generator)
    ? () => generator.values()
    : generator
  const fs = config.fs || []
  const reducer = config.reducer || defaultReducer
  const initial = config.initial || defaultInitial

  const map = f => {
    return LazySeqM(monad, _generator, {
      ...config,
      fs: fs.concat(f)
    })
  }

  const reduce = (reducer, initial) => {
    return LazySeqM(monad, _generator, {
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
    result: (fs, next) => chainM(monad)(...fs)(next)
  })

  return {
    map, reduce, take
  }
}

module.exports = LazySeqM
