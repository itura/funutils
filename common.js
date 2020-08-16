const { reduce } = require('./array')

const id = x => x
const apply = f => x => f(x)
const compose = f => g => x => f(g(x))
const tap = f => x => {
  f(x)
  return x
}

const chain = (...fs) => initial =>
  reduce(
    (result, f) => apply(f)(result),
    initial
  )(fs)

const applyP = P => f =>
  P.then(f)

const chainP = (...fs) => init =>
  reduce(
    (P, f) => applyP(P)(f),
    Promise.resolve(init)
  )(fs)

const applyM = M => f =>
  compose(M.bind(f))(M.unit)

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

const applyF = F => f =>
  F.map(f)

const chainF = F => (...fs) =>
  reduce(
    (F, f) => applyF(F)(f),
    F
  )(fs)

const fail = e => {
  console.error(e)
  process.exit(1)
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

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
  compose,
  id,
  tap,
  zip,
  randomInt,
  repeat,
  sleep,
  fail
}
