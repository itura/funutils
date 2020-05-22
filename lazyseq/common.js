
const lazyReduce = ({ generator, fs, result, reducer, initial }) => {
  let acc
  const _reduce = x => {
    acc = reducer(acc, x)
  }

  const take = n => {
    const iterator = generator()
    const _fs = fs.concat(_reduce)

    acc = initial()
    for (let i = 0; i < n; i++) {
      const next = iterator.next()
      if (next.done) {
        break
      }

      result(_fs, next.value)
    }

    return acc
  }

  return take
}

module.exports = { lazyReduce }
