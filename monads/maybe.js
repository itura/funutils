const { Bind } = require('./common')

const Nil = Symbol('nil')

const unit = x => {
  return x || x === 0 ? x : Nil
}

const lift = bind => (prev, fn) => {
  const monadicPrev = unit(prev)
  return monadicPrev === Nil
    ? Nil
    : unit(bind(monadicPrev, fn))
}

const MaybeMonad = {
  unit,
  lift,
  bind: lift(Bind),
  Nil
}

module.exports = MaybeMonad
