const { lazyReduce, integers } = require('./common')

const nil = Symbol('nil')
const nilCaseMap = (x, cases) =>
  x === nil
    ? cases.nil
    : cases.just(x)

const LazySeq = (generator = integers, fs = []) => {
  const map = function (f) {
    return LazySeq(generator, fs.concat(f))
  }

  const filter = function (f) {
    return LazySeq(generator, fs.concat(x => f(x) ? x : nil))
  }

  const compact = function () {
    return filter(x => {
      const emptyArray = !x || x.length === 0
      const zero = x === 0

      return !emptyArray || zero
    })
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
