const { apply, composeM, id, chain } = require('./common')
const { map, flatten, filter } = require('./array')
const { caseMap, Maybe } = require('./maybe')

const IdMonad = {
  bind: f => Mx => f(Mx),
  unit: id
}

const MaybeMonad = {
  unit: Maybe,
  bind: f => caseMap({
    just: apply(f)
  })
}

const seqCaseMap = cases => Mx => {
  if (Mx.length === 1) {
    if (Array.isArray(Mx[0])) {
      return cases.many(Mx[0])
    } else {
      return cases.one(Mx[0])
    }
  } else {
    return cases.many(Mx)
  }
}

const SequenceMonad = (...operations) => {
  return {
    unit: x => [x],
    bind: f => seqCaseMap({
      one: apply(f),
      many: xs => chain(
        map(apply(f)),
        ...operations,
        flatten()
      )(xs)
    })
  }
}

const NotNothingMonad = SequenceMonad(
  filter(chain(
    x => {
      return Maybe(x)
    },
    caseMap({
      just: () => true,
      nothing: () => false
    })
  ))
)
const SomethingMonad = composeM(NotNothingMonad)(MaybeMonad)

module.exports = {
  Id: IdMonad,
  Maybe: MaybeMonad,
  Sequence: SequenceMonad,
  FlatSequence: SequenceMonad(),
  Something: SomethingMonad
}
