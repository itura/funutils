const { map, reduce } = require('./array')

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

const chainP = (...fs) => initial =>
  reduce(
    (P, f) => applyP(P)(f),
    Promise.resolve(initial)
  )(fs)

const applyM = M => f =>
  compose(M.bind(f))(M.unit)

const chainM = M => (...fs) => initial =>
  reduce(
    (prev, f) => applyM(M)(f)(prev),
    initial
  )(fs)

const composeM = M1 => M2 => {
  return {
    bind: compose(M1.bind)(applyM(M2)),
    unit: M1.unit
  }
}

const applyF = F => f =>
  F.map(f)

const chainF = (...fs) => F =>
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

const repeat = (count, f) =>
  [...Array(count)].map((_, i) => f(i))

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const waitFor = async ({
  condition,
  interval = 50,
  max = 1000
}) => {
  let timeWaited = 0
  while (!condition()) {
    if (timeWaited >= max) {
      throw new Error(`condition not met in ${max}ms`)
    }
    timeWaited += interval
    await sleep(interval)
  }
}

const Builder = factory =>
  (...fs) => chain(
    ...map(f => config => ({ ...config, ...f(config) }))(fs),
    factory
  )(id)

const lessThan = a => b => b < a
const lessThanOrEqualTo = a => b => b <= a
const greaterThan = a => b => b > a
const greaterThanOrEqualTo = a => b => b >= a
const equalTo = a => b => a === b

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
  fail,
  lessThan,
  lessThanOrEqualTo,
  greaterThan,
  greaterThanOrEqualTo,
  equalTo,
  waitFor
}
