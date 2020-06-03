
const id = x => x
const compose = f => g => x => f(g(x))
const apply = f => x => f(x)

const chain = initial => (...fs) =>
  fs.reduce(
    (result, f) => apply(f)(result),
    initial
  )

const applyF = F => f =>
  F.map(f)

const chainF = F => (...fs) =>
  fs.reduce(
    (F, f) => applyF(F)(f),
    F
  )

const applyP = P => f =>
  P.then(f)

const chainP = (P = Promise.resolve()) => (...fs) =>
  fs.reduce(
    (P, f) => applyP(P)(f),
    P
  )

const applyM = M => f => compose(M.bind(f))(M.unit)

const chainM = M => (...fs) => initial =>
  fs.reduce(
    (prev, f) => applyM(M)(f)(prev),
    initial
  )

const composeM = M1 => M2 => {
  return {
    bind: compose(M1.bind)(applyM(M2)),
    unit: M1.unit
  }
}

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

const Builder = factory => {
  const BuilderF = (config = {}) => ({
    map: f => BuilderF({ ...config, ...f(config) }),
    apply: v => factory(config)(v)
  })

  const build = (...fs) =>
    chainF(BuilderF())(...fs).apply

  const buildWith = (...fs) => (...gs) =>
    chainF(BuilderF())(...fs, ...gs).apply

  return [build, buildWith, BuilderF]
}

module.exports = {
  apply,
  chain,
  applyF,
  chainF,
  applyP,
  chainP,
  applyM,
  chainM,
  composeM,
  Builder,
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
