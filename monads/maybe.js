const { Bind } = require('./common')
const { Nothing, caseMap, Maybe } = require('../types/maybe')

const unit = x => {
  return caseMap({
    nothing: () => Nothing,
    just: v => v
  })(Maybe(x))
}

const map = bind => (x, fn) => {
  return caseMap({
    nothing: () => Nothing,
    just: value => bind(value, fn)
  })(Maybe(x))
}

const join = () => null

const MaybeMonad = {
  unit,
  map,
  join,
  bind: map(Bind),
}

module.exports = MaybeMonad
