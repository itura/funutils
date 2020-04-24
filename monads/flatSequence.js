const { Bind } = require('./common')

const unit = x => {
  return Array.isArray(x) ? x : [x]
}

const lift = bind => (prev, fn) => {
  const monadicPrev = unit(prev)

  return monadicPrev
    .map(p => bind(p, fn))
    .flat()
}

const FlatSequenceMonad = {
  unit,
  lift,
  bind: lift(Bind),
}

module.exports = FlatSequenceMonad
