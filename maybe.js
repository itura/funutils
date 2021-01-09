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
    return map(f)(this)
  },
  caseMap: function (cases) {
    return caseMap(cases)(this)
  },
  dig: function (...keys) {
    return dig(...keys)(this)
  },
  toBoolean: function () {
    return toBoolean(this)
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
Just.prototype.toString = function () {
  return `maybe.Just ${this.value}`
}

const Nothing = function () {
  if (!(this instanceof Nothing)) {
    return nothing
  }
}

Nothing.prototype = Object.create(Maybe.prototype)
Nothing.prototype.toString = function () {
  return 'maybe.Nothing'
}

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

const map = f => caseMap({
  just: value => Maybe(f(value)),
  nothing: () => nothing
})

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

const conditions = (...specs) => chain(
  Maybe,
  caseMap({
    just: v => specs.reduce(
      (result, [condition, effect]) => result.caseMap({
        just: Maybe,
        nothing: () => Array.isArray(effect) && condition(v)
          ? conditions(...effect)(v)
          : Maybe(condition(v) && effect(v))
      }),
      nothing
    ),
    nothing: () => nothing
  })
)

const dig = (...keys) => obj =>
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
  map,
  isMaybe,
  given,
  none,
  conditions,
  dig,
  toBoolean
}
