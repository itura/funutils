const TruthyMonad = require('./truthy')
const SequenceMonad = require('./sequence')

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
  TruthyMonad,
  Nil: TruthyMonad.Nil,
  SequenceMonad,
  composeM,
  chainM
}
