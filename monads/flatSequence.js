const { Bind } = require('./common')

const unit = x => {
  return Array.isArray(x)
    ? x.length === 1
      ? x[0]
      : x
    : x
}

const map = bind => (x, fn) => {
  return Array.isArray(x)
    ? x
      .map(p => bind(p, fn))
      .flat()
    : bind(x, fn)
}

const FlatSequenceMonad = {
  unit,
  map,
  bind: map(Bind)
}

module.exports = FlatSequenceMonad
