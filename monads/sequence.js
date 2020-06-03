const { chain, map, flatten } = require('../common')

const caseMap = cases => Mx => {
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
    bind: f => caseMap({
      one: x => f(x),
      many: xs => chain(xs)(
        map(x => f(x)),
        ...operations,
        flatten()
      )
    })
  }
}

module.exports = SequenceMonad
