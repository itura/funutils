const maybe = require('./maybe')

const Result = function (value) {
  return isResult(value)
    ? value
    : maybe.Maybe(value).toBoolean()
      ? Success(value)
      : Failure(`Received ${value}`)
}

const resultMethods = {
  unwrap: function (cases) {
    return unwrap(cases)(this)
  },
  unwrapOr: function (f) {
    return unwrapOr(f)(this)
  },
  map: function (f) {
    return map(f)(this)
  },
  tapFailure: function (f) {
    return tapFailure(f)(this)
  }
}

const isResult = x => x instanceof Success || x instanceof Failure

const Success = function (value) {
  if (!(this instanceof Success)) {
    return new Success(value)
  }

  this.value = value
}
Success.prototype = Object.create(maybe.Just.prototype)
Object.assign(Success.prototype, {
  ...resultMethods,
  toString: function () {
    return `result.Success ${this.value}`
  }
})

const Failure = function (value) {
  if (!(this instanceof Failure)) {
    return new Failure(value)
  }

  this.value = value
}
Failure.prototype = Object.create(maybe.Nothing.prototype)
Object.assign(Failure.prototype, {
  ...resultMethods,
  toString: function () {
    return `result.Failure ${this.value}`
  }
})

const unwrap = cases => result => {
  if (result instanceof Success) {
    return cases.success ? cases.success(result.value) : result.value
  }

  if (result instanceof Failure) {
    if (!cases.failure) {
      throw new TypeError('funutils.result: unhandled Failure')
    }
    return cases.failure(result.value, result.initial)
  }

  throw new TypeError(`funutils.result: not a Result: '${result}'`)
}

const unwrapOr = f => unwrap({
  failure: value => f(value)
})

const map = f => unwrap({
  success: value => Result(f(value)),
  failure: Failure
})

const tapFailure = f => unwrap({
  success: Success,
  failure: value => {
    f(value)
    return Failure(value)
  }
})

module.exports = {
  Result,
  Success,
  Failure,
  isResult,
  unwrap,
  unwrapOr,
  map,
  tapFailure
}
