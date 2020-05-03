const monads = require('../monads')

const integers = function * () {
  let i = 0
  while (true) {
    yield i
    i++
  }
}
const LazySeqM = (monad, generator = integers) => {
  const fs = []

  const map = function (f) {
    fs.push(f)
    return this
  }

  let acc, _reduce
  const reduce = function (f, initial) {
    acc = initial
    _reduce = x => {
      acc = f(acc, x)
      return x
    }
    return this
  }

  const take = n => {
    const iterator = generator()
    const _fs = fs.concat(_reduce)

    let results = []
    for (let i = 0; i < n; i++) {
      const next = iterator.next()
      if (next.done) {
        break
      }

      if (_reduce) {
        monads.chainM(monad)(_fs)(next.value)
      } else {
        const result = monads.chainM(monad)(fs)(next.value)
        results = results.concat(result)
      }
    }

    return _reduce ? acc : results
  }

  return {
    map, reduce, take
  }
}

module.exports = LazySeqM
