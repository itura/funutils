const array = require('./array')
const { id, chain } = require('./common')

const Maybe = function (x) {
  return isMaybe(x)
    ? x
    : x === null || x === undefined
      ? nothing
      : Just(x)
}

Maybe.prototype = {
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

const Truthy = x =>
  isMaybe(x)
    ? x
    : x
      ? Just(x)
      : nothing

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
      (maybeArgs, m) => m.unwrap({
        just: () => m,
        nothing: () => maybeArgs.map(id)
      }),
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
      (result, [condition, effect]) => result.unwrap({
        just: Maybe,
        nothing: () => Array.isArray(effect) && condition(v)
          ? conditions(...effect)(v)
          : condition(v) ? Maybe(effect(v)) : nothing
      }),
      nothing
    ),
    nothing: () => nothing
  })
)

const dig = (...keys) => obj =>
  array.reduce(
    (result, key) => result.unwrap({
      just: r => Maybe(r[key]),
      nothing: () => nothing
    }),
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
