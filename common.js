
const id = x => x
const compose = (f, g) => x => f(g(x))

const chain = (...fs) =>
  fs.reduce(
    (result, f) => f(result)
  )

const chainP = (...fs) =>
  fs.reduce(
    (chain, f) => chain.then(f)
  )

const map = f => array => array.map(f)
const filter = f => array => array.filter(f)
const compact = () => array => array.filter(x => x || x === 0)
const flatten = (n = 1) => array => array.flat(n)
const reduce = (f, initial) => array => array.reduce(f, initial)
const tap = f => x => {
  f(x)
  return x
}

const _zip = (combo, ...xss) => {
  if (xss.length === 1) {
    return xss[0].flat().map(x => combo.concat(x))
  } else {
    const head = xss[0]
    const tail = xss.slice(1)
    return head.map(h => _zip(combo.concat(h), ...tail)).flat()
  }
}

const zip = (...xss) => {
  if (xss.length < 2) return xss
  return _zip([], ...xss)
}

const randomInt = (range, min = 0) =>
  Math.floor(Math.random() * Math.floor(range)) + min

const repeat = (count, fn) =>
  [...Array(count)].map((_, i) => fn(i))

module.exports = {
  chain,
  chainP,
  map,
  filter,
  compact,
  flatten,
  reduce,
  compose,
  id,
  tap,
  zip,
  randomInt,
  repeat
}
