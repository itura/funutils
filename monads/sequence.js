const { chain, map, flatten } = require('../common')

const caseMap = cases => Mx => {
  if (Mx.length === 1) {
    if (Array.isArray(Mx[0])) {
      return cases.flatten(Mx[0])
    } else {
      return cases.unit(Mx[0])
    }
  } else {
    return cases.flatten(Mx)
  }
}

const SequenceMonad = (...operations) => {
  return {
    unit: x => [x],
    bind: f => caseMap({
      unit: x => f(x),
      flatten: xs => chain(
        xs,
        map(x => f(x)),
        ...operations,
        flatten()
      )
    })
  }
}

module.exports = SequenceMonad
