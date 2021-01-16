const { apply, composeM, id, chain } = require('./common')
const { map, flat, filter } = require('./array')
const maybe = require('./maybe')
const result = require('./result')

const IdMonad = {
  unit: id,
  bind: apply
}

const MaybeMonad = {
  unit: maybe.Maybe,
  bind: f => maybe.unwrap({
    just: apply(f),
    nothing: maybe.Nothing
  })
}

const ResultMonad = {
  unit: result.Result,
  bind: f => result.unwrap({
    success: apply(f),
    failure: result.Failure
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
        flat()
      )
    })
  }
}

const NotNothingMonad = SequenceMonad(
  filter(chain(maybe.Maybe, maybe.toBoolean))
)
const SomethingMonad = composeM(NotNothingMonad)(MaybeMonad)

module.exports = {
  Id: IdMonad,
  Maybe: MaybeMonad,
  Result: ResultMonad,
  Sequence: SequenceMonad,
  FlatSequence: SequenceMonad(),
  Something: SomethingMonad
}
