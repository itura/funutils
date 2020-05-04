const monads = require('../monads')
const { lazyReduce, integers } = require('./common')

const LazySeqM = (monad, generator = integers) => {
  const fs = []

  const map = function (f) {
    fs.push(f)
    return this
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
