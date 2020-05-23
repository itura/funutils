const MaybeMonad = require('./maybe')
const { Nothing } = require('../maybe')
const SequenceMonad = require('./sequence')
const { compose, id, filter } = require('../common')

const applyM = M => f => compose(M.bind(f))(M.unit)

const composeM = M1 => M2 => {
  return {
    bind: compose(M1.bind)(applyM(M2)),
    unit: M1.unit
  }
}

const chainM = M => fs => initial =>
  fs.reduce(
    (prev, f) => applyM(M)(f)(prev),
    initial
  )

const IdMonad = {
  bind: f => Mx => f(Mx),
  unit: id
}

const NotNothingMonad = SequenceMonad(filter(x => x !== Nothing))
const SomethingMonad = composeM(NotNothingMonad)(MaybeMonad)

module.exports = {
  Id: IdMonad,
  Maybe: MaybeMonad,
  Sequence: SequenceMonad,
  FlatSequence: SequenceMonad(),
  Something: SomethingMonad,
  composeM,
  chainM,
  applyM
}
