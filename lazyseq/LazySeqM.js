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

  const take = n => {
    const iterator = generator()

    let results = []
    for (let i = 0; i < n; i++) {
      const next = iterator.next()
      if (next.done) {
        break
      }

      const result = monads.chainM(monad)(fs)(next.value)

      results = results.concat(result)
    }

    return results
  }

  return {
    map, take
  }
}

module.exports = LazySeqM
