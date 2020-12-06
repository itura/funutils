const array = require('./array')
const { id, chain } = require('./common')

const Maybe = function (x) {
  return isMaybe(x)
    ? x
    : x || x === 0
      ? Just(x)
      : nothing
}

Maybe.prototype = {
  map: function (f) {
    return caseMap({
      just: value => Maybe(f(value)),
      nothing: () => nothing
    })(this)
  },
  caseMap: function (cases) {
    return caseMap(cases)(this)
  }
}

const isMaybe = x => x instanceof Maybe

const Just = function (value) {
  if (!(this instanceof Just)) {
    return new Just(value)
  }

  this.value = value
}

Just.prototype = Object.create(Maybe.prototype)

const Nothing = function () {
  if (!(this instanceof Nothing)) {
    return nothing
  }
}

Nothing.prototype = Object.create(Maybe.prototype)

const nothing = new Nothing()

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

  throw new TypeError(`funutils.maybe: not a Maybe: '${maybe}'`)
}

const given = (...ms) => f =>
  chain(
    array.reduce(
      (maybeArgs, m) => m.caseMap({
        just: v => maybeArgs.map(args => args.concat(v)),
        nothing: () => nothing
      }),
      Just([])
    ),

    caseMap({
      just: args => Just(f(...args)),
      nothing: () => nothing
    })
  )(ms)

const none = (...ms) => f =>
  chain(
    array.reduce(
      (maybeArgs, m) => m.caseMap({
        just: () => m,
        nothing: () => maybeArgs.map(id)
      }),
      nothing
    ),

    caseMap({
      just: () => nothing,
      nothing: () => Just(f())
    })
  )(ms)

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

const dig = (obj, ...keys) =>
  array.reduce(
    (result, key) => result.caseMap({
      just: r => Maybe(r[key]),
      nothing: () => nothing
    }),
    Maybe(obj)
  )(keys)

const toBoolean = caseMap({
  just: () => true,
  nothing: () => false
})

module.exports = {
  Maybe,
  Just,
  Nothing,
  caseMap,
  isMaybe,
  given,
  none,
  cases,
  dig,
  toBoolean
}
