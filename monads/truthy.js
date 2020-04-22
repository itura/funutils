const { Bind } = require('./common')

const Nil = Symbol('nil')

const TruthyUnit = x => {
  return x || x === 0 ? x : Nil
}
const TruthyLift = bind => (prev, fn) => {
  const monadicPrev = TruthyUnit(prev)
  return monadicPrev === Nil
    ? Nil
    : TruthyUnit(bind(monadicPrev, fn))
}

const TruthyMonad = {
  unit: TruthyUnit,
  bind: TruthyLift(Bind),
  lift: TruthyLift,
  Nil
}

module.exports = TruthyMonad
