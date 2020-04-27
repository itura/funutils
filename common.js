
const id = x => x
const compose = (f, g) => x => f(g(x))

const chain = (initial, ...fns) =>
  fns.reduce(
    (result, fn) => fn(result),
    initial
  )

const map = fn => array => array.map(fn)
const filter = fn => array => array.filter(fn)
const compact = () => array => array.filter(x => x || x === 0)
const flatten = (n = 1) => array => array.flat(n)
const reduce = (fn, initial) => array => array.reduce(fn, initial)

module.exports = {
  chain,
  map,
  filter,
  compact,
  flatten,
  reduce,
  compose,
  id
}
