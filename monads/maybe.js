const { Nothing, caseMap, Maybe } = require('../types/maybe')

const unit = x => {
  return Maybe(x)
}

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
