const monads = require('../monads')
const { Nothing } = require('../types/maybe')

const LazySeqM = (startSequence, monad) => {
  const fs = []

  const map = function (f) {
    fs.push(f)
    return this
  }

  const take = n => {
    const iterator = startSequence()

    let results = []
    for (let i = 0; i < n; i++) {
      const next = iterator.next()
      if (next.done) {
        break
      }

      const result = monads.chainM(monad)(fs)(next.value)

      if (result !== Nothing) {
        results = results.concat(result)
      }
    }

    return results
  }

  return {
    map, take
  }
}

module.exports = LazySeqM