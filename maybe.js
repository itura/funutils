
const map = function (f) {
  return caseMap({
    nothing: () => nothing,
    just: value => Just(f(value))
  })(this)
}
const Just = function (value) {
  if (!(this instanceof Just)) {
    return new Just(value)
  }

  this.value = value
}
Just.prototype = {
  map
}

const Nothing = function () {
}
Nothing.prototype = {
  map
}

const Maybe = x => {
  return isMaybe(x)
    ? x
    : x || x === 0
      ? Just(x)
      : nothing
}

const isMaybe = x => x instanceof Just || x instanceof Nothing

const nothing = new Nothing()

const caseMap = cases => maybe => {
  if (maybe instanceof Just) {
    return cases.just(maybe.value)
  }

  if (maybe instanceof Nothing) {
    return cases.nothing()
  }

  throw new TypeError(`Not a Maybe: ${maybe}`)
}

module.exports = {
  Just,
  Nothing: nothing,
  caseMap,
  isMaybe,
  Maybe
}
