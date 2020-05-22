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

const verbose = false

const perfTest = (title, expectedDuration, action, check, t = test) => {
  t(`${title} < ${expectedDuration} ms`, async () => {
    const [results, duration] = await time(action)

    if (verbose) {
      console.log(`${title}: `, duration.toFixed(0), 'ms')
    }

    expect(duration).toBeLessThan(expectedDuration)
    check(results)
  })
}

describe('LazySeq(M) promise reducer performance', () => {
  const count = 20000

  let inserted
  const insertToDb = data => {
    const result = `Inserted ${data}`
    inserted++
    return Promise.resolve(result)
  }

  beforeEach(() => {
    inserted = 0
  })

  const fireAndForget =
    (chain, next) =>
      chain.then(() => next)

  const collectAll =
    (chain, next) =>
      chain.then(results =>
        next.then(r => results.concat(r))
      )

  const collectAllFast =
    (chain, next) =>
      chain.then(results =>
        next.then(r => {
          results.push(r) // it's fast bc we mutate the acc
          return results
        })
      )

  describe('LazySeq', () => {
    perfTest('LazySeq: fireAndForget normal reduce', 2100,
      () => LazySeq()
        .map(x => x + 1)
        .map(insertToDb)
        .take(count)
        .reduce(fireAndForget, Promise.resolve()),
      results => {
        expect(inserted).toEqual(count)
        expect(results).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('LazySeq: fireAndForget lazy reduce', 60,
      () => LazySeq()
        .map(x => x + 1)
        .map(insertToDb)
        .reduce(fireAndForget, Promise.resolve())
        .take(count),
      results => {
        expect(inserted).toEqual(count)
        expect(results).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('LazySeq: collectAll normal reduce', 5700,
      () => LazySeq()
        .map(x => x + 1)
        .map(insertToDb)
        .take(count)
        .reduce(collectAll, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('LazySeq: collectAll lazy reduce',
      3600,
      () => LazySeq()
        .map(x => x + 1)
        .map(insertToDb)
        .reduce(collectAll, Promise.resolve([]))
        .take(count),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('LazySeq: collectAllFast normal reduce', 2400,
      () => LazySeq()
        .map(x => x + 1)
        .map(insertToDb)
        .take(count)
        .reduce(collectAllFast, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('LazySeq: collectAllFast lazy reduce', 100,
      () => LazySeq()
        .map(x => x + 1)
        .map(insertToDb)
        .reduce(collectAllFast, Promise.resolve([]))
        .take(count),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )
  })

  describe('LazySeqM', () => {
    perfTest('LazySeqM: fireAndForget normal reduce', 2500,
      () => LazySeqM(monads.FlatSequence)
        .map(x => [x + 1, x + 2])
        .map(insertToDb)
        .take(count / 2)
        .reduce(fireAndForget, Promise.resolve()),
      results => {
        expect(inserted).toEqual(count)
        expect(results).toEqual(`Inserted ${count / 2 + 1}`)
      }
    )

    perfTest('LazySeqM: fireAndForget lazy reduce', 100,
      () => LazySeqM(monads.FlatSequence)
        .map(x => [x + 1, x + 2])
        .map(insertToDb)
        .reduce(fireAndForget, Promise.resolve())
        .take(count / 2),
      results => {
        expect(inserted).toEqual(count)
        expect(results).toEqual(`Inserted ${count / 2 + 1}`)
      }
    )

    perfTest('LazySeqM: collectAll normal reduce', 6000,
      () => LazySeqM(monads.FlatSequence)
        .map(x => [x + 1, x + 2])
        .map(insertToDb)
        .take(count / 2)
        .reduce(collectAll, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
      }
    )

    perfTest('LazySeqM: collectAll lazy reduce', 3700,
      () => LazySeqM(monads.FlatSequence)
        .map(x => [x + 1, x + 2])
        .map(insertToDb)
        .reduce(collectAll, Promise.resolve([]))
        .take(count / 2),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
      }
    )

    perfTest('LazySeqM: collectAllFast normal reduce', 2500,
      () => LazySeqM(monads.FlatSequence)
        .map(x => [x + 1, x + 2])
        .map(insertToDb)
        .take(count / 2)
        .reduce(collectAllFast, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
      }
    )

    perfTest('LazySeqM: collectAllFast lazy reduce', 100,
      () => LazySeqM(monads.FlatSequence)
        .map(x => [x + 1, x + 2])
        .map(insertToDb)
        .reduce(collectAllFast, Promise.resolve([]))
        .take(count / 2),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
      }
    )
  })
})
