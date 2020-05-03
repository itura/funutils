/* eslint-env jest */

const LazySeqM = require('./LazySeqM')
const monads = require('../monads')
const { performance } = require('perf_hooks')

const time = async (action) => {
  const t0 = performance.now()
  const result = await action()
  const t1 = performance.now()
  const durationMs = t1 - t0
  return [result, durationMs]
}

describe('LazySeqM promise reducer performance', () => {
  const count = 10000

  const generateData = x => [x + 1, x + 2]

  let inserted = 0
  const insertToDb = data => {
    const result = `Inserted ${data}`
    inserted++
    return Promise.resolve(result)
  }

  const transform = LazySeqM(monads.FlatSequence)
    .map(generateData)
    .map(insertToDb)

  test(`collecting all vs fire and forget @ ${count} results`, async () => {
    const [fireAndForget, d0] = await time(() =>
      transform
        .reduce(
          (chain, p) => chain.then(() => p),
          Promise.resolve()
        )
        .take(count)
    )

    expect(fireAndForget).toEqual(`Inserted ${count + 1}`)
    expect(inserted).toEqual(count * 2)

    const [collectAll, d1] = await time(() =>
      transform
        .reduce(
          (chain, p) => chain.then(results =>
            p.then(r => results.concat(r))),
          Promise.resolve([])
        )
        .take(count)
    )

    expect(collectAll.length).toEqual(count * 2)
    expect(inserted).toEqual(count * 4)

    console.log('fireAndForget', d0.toFixed(0), 'ms')
    console.log('collectAll', d1.toFixed(0), 'ms')

    expect(d0 < 100).toEqual(true)
    expect(d1 < 3500).toEqual(true)
  })
})
