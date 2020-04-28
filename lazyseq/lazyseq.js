const monads = require('../monads')
const { Nothing } = require('../types/maybe')

const LazySeq = startSequence => {
  const fs = []
  let currentM = monads.Id

  const withM = function (M) {
    currentM = monads.composeM(currentM)(M)
    return this
  }

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

      const result = monads.chainM(currentM)(fs)(next.value)

      if (result !== Nothing) {
        results = results.concat(result)
      }
    }

    return results
  }

  return {
    withM, map, take
  }
}

module.exports = { LazySeq }
