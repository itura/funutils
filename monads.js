const { apply, composeM, id, chain } = require('./common')
const { map, flatten, filter } = require('./array')
const maybe = require('./maybe')

const IdMonad = {
  unit: id,
  bind: apply
}

const MaybeMonad = {
  unit: maybe.Maybe,
  bind: f => maybe.caseMap({
    just: apply(f),
    nothing: maybe.Nothing
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
    unit: Array.of,
    bind: f => seqCaseMap({
      one: apply(f),
      many: chain(
        map(apply(f)),
        ...operations,
        flatten()
      )
    })
  }
}

const NotNothingMonad = SequenceMonad(
  filter(chain(
    maybe.Maybe,
    maybe.caseMap({
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
