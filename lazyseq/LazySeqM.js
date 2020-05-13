const monads = require('../monads')
const { lazyReduce, integers } = require('./common')

const LazySeqM = (monad, generator = integers, fs = []) => {
  const map = function (f) {
    return LazySeqM(monad, generator, fs.concat(f))
  }

  const [reduce, take] = lazyReduce(generator, fs, {
    result: (fs, next) => monads.chainM(monad)(fs)(next),
    results: (results, result) => results.concat(result)
  })

  return {
    map, reduce, take
  }
}

module.exports = LazySeqM
