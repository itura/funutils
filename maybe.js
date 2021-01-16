const array = require('./array')
const { id, chain } = require('./common')

const Maybe = function (x) {
  return isMaybe(x)
    ? x
    : x === null || x === undefined
      ? nothing
      : Just(x)
}

const Truthy = x =>
  isMaybe(x)
    ? x
    : x
      ? Just(x)
      : nothing

const maybeMethods = {
  map: function (f) {
    return map(f)(this)
  },
  unwrap: function (cases) {
    return unwrap(cases)(this)
  },
  unwrapOr: function (f) {
    return unwrapOr(f)(this)
  },
  dig: function (...keys) {
    return dig(...keys)(this)
  },
  toBoolean: function () {
    return toBoolean(this)
  }
}

const isMaybe = x => x instanceof Just || x instanceof Nothing

const Just = function (value) {
  if (!(this instanceof Just)) {
    return new Just(value)
  }

  this.value = value
}

Just.prototype = {
  ...maybeMethods,
  toString: function () {
    return `maybe.Just ${this.value}`
  }
}

const Nothing = function () {
  if (!(this instanceof Nothing)) {
    return nothing
  }
}

Nothing.prototype = {
  ...maybeMethods,
  toString: function () {
    return 'maybe.Nothing'
  }
}
const nothing = new Nothing()

const unwrap = cases => maybe => {
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

const map = f => unwrap({
  just: value => Maybe(f(value)),
  nothing: () => nothing
})

const unwrapOr = f => unwrap({
  nothing: () => f()
})

const given = (...ms) => f =>
  chain(
    array.reduce(
      (maybeArgs, m) => maybeArgs.map(
        args => m.map(v => args.concat(v))
      ),
      Just([])
    ),

    map(args => f(...args))
  )(ms)

const none = (...ms) => f =>
  chain(
    array.reduce(
      (maybeArgs, m) => unwrap({
        just: () => m,
        nothing: () => maybeArgs.map(id)
      })(m),
      nothing
    ),

    unwrap({
      just: () => nothing,
      nothing: () => Maybe(f())
    })
  )(ms)

const conditions = (...specs) => chain(
  Maybe,
  unwrap({
    just: v => specs.reduce(
      (result, [condition, effect]) => unwrap({
        just: Maybe,
        nothing: () => Array.isArray(effect) && condition(v)
          ? conditions(...effect)(v)
          : condition(v) ? Maybe(effect(v)) : nothing
      })(result),
      nothing
    ),
    nothing: () => nothing
  })
)

const dig = (...keys) => obj =>
  array.reduce(
    (result, key) => unwrap({
      just: r => Maybe(r[key]),
      nothing: () => nothing
    })(result),
    Maybe(obj)
  )(keys)

const toBoolean = unwrap({
  just: () => true,
  nothing: () => false
})

module.exports = {
  Maybe,
  Truthy,
  Just,
  Nothing,
  unwrap,
  map,
  unwrapOr,
  isMaybe,
  given,
  none,
  conditions,
  dig,
  toBoolean
}
