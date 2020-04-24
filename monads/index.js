const MaybeMonad = require('./maybe')
const FlatSequenceMonad = require('./flatSequence')

const composeM = (m1, m2) => {
  return {
    bind: m1.lift(m2.bind),
    unit: m1.unit
  }
}

const chainM = (monad, fns, initial) =>
  fns.reduce(
    (prev, fn) => monad.bind(prev, fn),
    initial
  )

module.exports = {
  MaybeMonad,
  Nil: MaybeMonad.Nil,
  FlatSequenceMonad,
  composeM,
  chainM
}
