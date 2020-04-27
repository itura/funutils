const { Nothing, caseMap, Maybe } = require('../types/maybe')

const unit = x => {
  return Maybe(x)
}

const bind = f => Mx => {
  return caseMap({
    nothing: () => Nothing,
    just: value => f(value)
  })(Mx)
}

const MaybeMonad = {
  unit,
  bind
}

module.exports = MaybeMonad
