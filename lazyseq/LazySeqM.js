const { chainM } = require('../common')
const { lazyReduce } = require('./common')
const { integers } = require('../generators')

const defaultReducer = (results, result) => results.concat(result)

const defaultInitial = () => []

const LazySeqM = (monad, generator = integers, config = {}) => {
  const fs = config.fs || []
  const reducer = config.reducer || defaultReducer
  const initial = config.initial || defaultInitial

  const map = f => {
    return LazySeqM(monad, generator, {
      ...config,
      fs: fs.concat(f)
    })
  }

  const reduce = (reducer, initial) => {
    return LazySeqM(monad, generator, {
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
    result: (fs, next) => chainM(monad)(...fs)(next)
  })

  return {
    map, reduce, take
  }
}

module.exports = LazySeqM
