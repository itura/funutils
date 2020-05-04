const { lazyReduce, integers } = require('./common')

const LazySeq = (generator = integers) => {
  const fs = []

  const map = function (f) {
    fs.push(f)
    return this
  }

  const nil = Symbol('nil')
  const nilCaseMap = (x, cases) =>
    x === nil
      ? cases.nil
      : cases.just(x)
  const filter = function (f) {
    fs.push(x => f(x) ? x : nil)
    return this
  }

  const compact = function () {
    filter(x => {
      const emptyArray = !x || x.length === 0
      const zero = x === 0

      return !emptyArray || zero
    })
    return this
  }

  const [reduce, take] = lazyReduce(generator, fs, {
    result: (fs, next) => fs.reduce(
      (prev, f) => nilCaseMap(prev, {
        nil: nil,
        just: x => f(x)
      }),
      next
    ),
    results: (acc, result) => nilCaseMap(result, {
      nil: acc,
      just: x => acc.concat(x)
    })
  })

  return {
    map, filter, compact, reduce, take
  }
}

module.exports = LazySeq
