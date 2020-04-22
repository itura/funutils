const { Bind } = require('./common')

const SequenceUnit = x => {
  return Array.isArray(x) ? x : [x]
}

const SequenceLift = bind => (prev, fn) => {
  const monadicPrev = SequenceUnit(prev)

  return monadicPrev
    .map(p => bind(p, fn))
    .flat()
}

const SequenceMonad = {
  unit: SequenceUnit,
  bind: SequenceLift(Bind),
  lift: SequenceLift
}

module.exports = SequenceMonad
