const { Nothing, caseMap, Maybe } = require('../maybe')

const unit = Maybe

const bind = f => {
  return caseMap({
    nothing: () => Nothing,
    just: value => f(value)
  })
}

const MaybeMonad = {
  unit,
  bind
}

module.exports = MaybeMonad
