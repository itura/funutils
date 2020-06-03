const { apply, composeM, id, filter, chain, map, flatten } = require('./common')
const { Nothing, caseMap, Maybe } = require('./maybe')

const IdMonad = {
  bind: f => Mx => f(Mx),
  unit: id
}

const MaybeMonad = {
  unit: Maybe,
  bind: f => caseMap({
    nothing: () => Nothing,
    just: value => f(value)
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
      many: xs => chain(xs)(
        map(x => f(x)),
        ...operations,
        flatten()
      )
    })
  }
}

const NotNothingMonad = SequenceMonad(filter(x => x !== Nothing))
const SomethingMonad = composeM(NotNothingMonad)(MaybeMonad)

module.exports = {
  Id: IdMonad,
  Maybe: MaybeMonad,
  Sequence: SequenceMonad,
  FlatSequence: SequenceMonad(),
  Something: SomethingMonad
}