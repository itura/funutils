
const lazyReduce = (generator, fs, { result, results }) => {
  let acc
  let _initial = () => []
  let _reduce = x => {
    acc = results(acc, x)
  }
  const reduce = function (f, initial) {
    _initial = () => initial
    _reduce = x => {
      acc = f(acc, x)
    }
    return this
  }

  const take = n => {
    const iterator = generator()
    const _fs = fs.concat(_reduce)
    acc = _initial()

    for (let i = 0; i < n; i++) {
      const next = iterator.next()
      if (next.done) {
        break
      }

      result(_fs, next.value)
    }

    return acc
  }

  return [reduce, take]
}

module.exports = { lazyReduce }
