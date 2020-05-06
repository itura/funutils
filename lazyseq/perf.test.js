/* eslint-env jest */

const LazySeqM = require('./LazySeqM')
const LazySeq = require('./LazySeq')
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

  test(`collecting all vs fire and forget @ ${count}`, async () => {
    const [fireAndForget, d0] = await time(() =>
      transform
        .reduce(
          (chain, next) => chain.then(() => next),
          Promise.resolve()
        )
        .take(count)
    )

    expect(fireAndForget).toEqual(`Inserted ${count + 1}`)
    expect(inserted).toEqual(count * 2)

    const [collectAll, d1] = await time(() =>
      transform
        .reduce(
          (chain, next) =>
            chain.then(results =>
              next.then(r => results.concat(r))
            ),
          Promise.resolve([])
        )
        .take(count)
    )

    expect(collectAll.length).toEqual(count * 2)
    expect(inserted).toEqual(count * 4)

    const [collectAllQuick, d2] = await time(() =>
      transform
        .reduce(
          (chain, next) =>
            chain.then(results =>
              next.then(r => {
                results.push(r) // it's fast bc we mutate the acc
                return results
              })
            ),
          Promise.resolve([])
        )
        .take(count)
    )

    expect(collectAllQuick.length).toEqual(count * 2)
    expect(inserted).toEqual(count * 6)

    console.log('fireAndForget', d0.toFixed(0), 'ms')
    console.log('collectAll', d1.toFixed(0), 'ms')
    console.log('collectAllQuick', d2.toFixed(0), 'ms')
    console.log('===========')

    expect(d0).toBeLessThan(100)
    expect(d1).toBeLessThan(3600)
    expect(d2).toBeLessThan(100)
  })
})

describe('LazySeq promise reducer performance', () => {
  const count = 20000

  const generateData = x => x + 1

  let inserted = 0
  const insertToDb = data => {
    const result = `Inserted ${data}`
    inserted++
    return Promise.resolve(result)
  }

  const transform = LazySeq()
    .map(generateData)
    .map(insertToDb)

  test(`collecting all vs fire and forget @ ${count}`, async () => {
    const [fireAndForget, d0] = await time(() =>
      transform
        .reduce(
          (chain, next) => chain.then(() => next),
          Promise.resolve()
        )
        .take(count)
    )

    expect(fireAndForget).toEqual(`Inserted ${count}`)
    expect(inserted).toEqual(count)

    const [collectAll, d1] = await time(() =>
      transform
        .reduce(
          (chain, next) =>
            chain.then(results =>
              next.then(r => results.concat(r))
            ),
          Promise.resolve([])
        )
        .take(count)
    )

    expect(collectAll.length).toEqual(count)
    expect(inserted).toEqual(count * 2)

    const [collectAllQuick, d2] = await time(() =>
      transform
        .reduce(
          (chain, next) =>
            chain.then(results =>
              next.then(r => {
                results.push(r) // it's fast bc we mutate the acc
                return results
              })
            ),
          Promise.resolve([])
        )
        .take(count)
    )

    expect(collectAllQuick.length).toEqual(count)
    expect(inserted).toEqual(count * 3)

    console.log('fireAndForget', d0.toFixed(0), 'ms')
    console.log('collectAll', d1.toFixed(0), 'ms')
    console.log('collectAllQuick', d2.toFixed(0), 'ms')
    console.log('===========')

    expect(d0).toBeLessThan(50)
    expect(d1).toBeLessThan(3600)
    expect(d2).toBeLessThan(50)
  })
})
