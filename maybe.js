const array = require('./array')
const { id } = require('./common')

const map = function (f) {
  return caseMap({
    nothing: () => nothing,
    just: value => Maybe(f(value))
  })(this)
}

const caseMapMethod = function (cases) {
  return caseMap(cases)(this)
}

const Just = function (value) {
  if (!(this instanceof Just)) {
    return new Just(value)
  }

  this.value = value
}
Just.prototype = {
  map,
  caseMap: caseMapMethod
}

const Nothing = function () {
  if (!(this instanceof Nothing)) {
    return new Nothing()
  }
}
Nothing.prototype = {
  map,
  caseMap: caseMapMethod
}

const isMaybe = x => x instanceof Just || x instanceof Nothing

const nothing = new Nothing()

const Maybe = x => {
  return isMaybe(x)
    ? x
    : x || x === 0
      ? Just(x)
      : nothing
}

const caseMap = cases => maybe => {
  if (maybe instanceof Just) {
    return cases.just ? cases.just(maybe.value) : maybe.value
  }

  if (maybe instanceof Nothing) {
    if (!cases.nothing) {
      throw new TypeError('funutils.maybe: unhandled Nothing')
    }
    return cases.nothing()
  }

  throw new TypeError(`Not a Maybe: '${maybe}'`)
}

const given = (...ms) => f => {
  const maybeArgs = array.reduce(
    (maybeArgs, m) => caseMap({
      just: v => maybeArgs.map(args => args.concat(v)),
      nothing: () => nothing
    })(m),
    Just([])
  )(ms)

  return caseMap({
    just: args => Just(f(...args)),
    nothing: () => nothing
  })(maybeArgs)
}

const none = (...ms) => f => {
  const maybeArgs = array.reduce(
    (maybeArgs, m) => caseMap({
      just: () => m,
      nothing: () => maybeArgs.map(id)
    })(m),
    nothing
  )(ms)

  return caseMap({
    just: () => nothing,
    nothing: () => Just(f())
  })(maybeArgs)
}

const cases = (...specs) =>
  array.reduce(
    (result, [condition, effect]) => result.caseMap({
      just: Maybe,
      nothing: () => condition && Array.isArray(effect)
        ? cases(...effect).caseMap({ just: Maybe })
        : Maybe(condition && effect())
    }),
    nothing
  )(specs)

module.exports = {
  Just,
  Nothing,
  caseMap,
  isMaybe,
  Maybe,
  given,
  none,
  cases
}
