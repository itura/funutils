const caseMap = cases => maybe => {
  if (maybe instanceof Just) {
    return cases.just(maybe.value)
  }

  if (maybe instanceof Nothing) {
    return cases.nothing()
  }

  throw new TypeError(`Not a Maybe: ${maybe}`)
}

const nothing = new Nothing()

function map (f) {
  return caseMap({
    nothing: () => nothing,
    just: value => new Just(f(value))
  })(this)
}

function Just (value) {
  if (!(this instanceof Just)) {
    return new Just(value)
  }

  this.value = value
  this.map = map
}

function Nothing () {
  this.map = map
}

const Maybe = x => {
  return isMaybe(x)
    ? x
    : x || x === 0
      ? Just(x)
      : nothing
}

const isMaybe = x => x instanceof Just || x instanceof Nothing

module.exports = {
  Just,
  Nothing: nothing,
  caseMap,
  isMaybe,
  Maybe
}
