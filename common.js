const { map, reduce } = require('./array')
const { performance } = require('perf_hooks')

const id = x => x
const apply = f => x => f(x)
const compose = f => g => x => f(g(x))
const tap = f => x => {
  f(x)
  return x
}

const chain = initial => (...fs) =>
  reduce(
    (result, f) => apply(f)(result),
    initial
  )(fs)

const chainWith = wrapper => initial => (...fs) =>
  chain(initial)(
    ...map(wrapper)(fs)
  )

const applyF = F => f =>
  F.map(f)

const chainF = F => (...fs) =>
  reduce(
    (F, f) => applyF(F)(f),
    F
  )(fs)

const applyP = P => f =>
  P.then(f)

const chainP = init => (...fs) =>
  reduce(
    (P, f) => applyP(P)(f),
    Promise.resolve(init)
  )(fs)

const time = async (action) => {
  const t0 = performance.now()
  const result = await action()
  const t1 = performance.now()
  const durationMs = t1 - t0
  return [durationMs, result]
}

const fail = e => {
  console.error(e)
  process.exit(1)
}

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
  chainWith,
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
  time,
  fail
}
