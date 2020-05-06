
const id = x => x
const compose = (f, g) => x => f(g(x))

const chain = (...fs) =>
  fs.reduce(
    (result, f) => f(result)
  )

const chainP = (...fs) =>
  fs.reduce(
    (chain, f) => chain.then(x => f(x))
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

const zip = (...xs) => {
  return xs.reduce(
    (as, bs) => as.map(a => bs.map(b => [a, b])).flat()
  )
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
