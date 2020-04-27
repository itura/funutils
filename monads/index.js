const MaybeMonad = require('./maybe')
const FlatSequenceMonad = require('./flatSequence')
const { compose } = require('../common')

const applyM = M => f => compose(M.bind(f), M.unit)

const composeM = M1 => M2 => {
  return {
    bind: compose(M1.bind, applyM(M2)),
    unit: M1.unit
  }
}

const chainM = monad => fs => initial =>
  fs.reduce(
    (prev, f) => applyM(monad)(f)(prev),
    initial
  )

module.exports = {
  MaybeMonad,
  FlatSequenceMonad,
  composeM,
  chainM,
  applyM
}
