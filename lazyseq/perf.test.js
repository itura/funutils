/* eslint-env jest */

/*
Findings (with node v12.18.3, v14.4.0)
- Generally, LazySeq performs the same as native array and LazySeqM performs worse
- LazySeq will perform marginally better than native array when there are many
  transformations on a very large array, but it's not as pronounced as I expected
- Tests in node env are slightly faster than in jsdom, which maybe warrants a test
  in an actual browser
 */

const LazySeqM = require('./LazySeqM')
const LazySeq = require('./LazySeq')
const monads = require('../monads')
const { repeat, randomInt } = require('../common')
const perf = require('../perf')(global.performance || require('perf_hooks').performance)

const count = 24000

const perfTest = (title, expectedDuration, action, check, t = test) => {
  t(`${expectedDuration}#${title}`, async () => {
    const [duration, results] = await perf.time(action)

    expect(duration).toBeLessThan(expectedDuration)
    check(results)
  })
}

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

const data = repeat(count, i => ({ count: i, rando: randomInt(100), string: `${i} hi` }))
const transform = x => ({ ...x, count: x.count + 1, random: randomInt(100 + x.count) })
const transformM = x => [
  ({ ...x, count: x.count + 1, random: randomInt(100 + x.count) }),
  ({ ...x, count: x.count + 2, random: randomInt(100 + x.count) })
]

let inserted
const insertToDb = data => {
  inserted++
  const result = `Inserted ${data.count}`
  return Promise.resolve(result)
}

describe('Native array', () => {
  beforeEach(() => {
    inserted = 0
  })

  perfTest('fireAndForget', 60,
    () => data
      .map(transform)
      .map(insertToDb)
      .reduce(fireAndForget, Promise.resolve()),
    results => {
      expect(inserted).toEqual(count)
      expect(results).toEqual(`Inserted ${count}`)
    }
  )

  perfTest('collectAll', 5000,
    () => data
      .map(transform)
      .map(insertToDb)
      .reduce(collectAll, Promise.resolve([])),
    results => {
      expect(inserted).toEqual(count)
      expect(results[count - 1]).toEqual(`Inserted ${count}`)
    }
  )

  perfTest('collectAllFast', 60,
    () => data
      .map(transform)
      .map(insertToDb)
      .reduce(collectAllFast, Promise.resolve([])),
    results => {
      expect(inserted).toEqual(count)
      expect(results[count - 1]).toEqual(`Inserted ${count}`)
    }
  )
})

describe('LazySeq', () => {
  beforeEach(() => {
    inserted = 0
  })

  describe('with normal reduce', () => {
    perfTest('fireAndForget', 60,
      () => LazySeq(data)
        .map(transform)
        .map(insertToDb)
        .take(count)
        .reduce(fireAndForget, Promise.resolve()),
      results => {
        expect(inserted).toEqual(count)
        expect(results).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAll', 5000,
      () => LazySeq(data)
        .map(transform)
        .map(insertToDb)
        .take(count)
        .reduce(collectAll, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAllFast', 60,
      () => LazySeq(data)
        .map(transform)
        .map(insertToDb)
        .take(count)
        .reduce(collectAllFast, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )
  })

  describe('with lazy reduce', () => {
    perfTest('fireAndForget', 60,
      () => LazySeq(data)
        .map(transform)
        .map(insertToDb)
        .reduce(fireAndForget, Promise.resolve())
        .take(count),
      results => {
        expect(inserted).toEqual(count)
        expect(results).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAll', 3800,
      () => LazySeq(data)
        .map(transform)
        .map(insertToDb)
        .reduce(collectAll, Promise.resolve([]))
        .take(count),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAllFast', 100,
      () => LazySeq(data)
        .map(transform)
        .map(insertToDb)
        .reduce(collectAllFast, Promise.resolve([]))
        .take(count),
      results => {
        expect(inserted).toEqual(count)
        expect(results[count - 1]).toEqual(`Inserted ${count}`)
      }
    )
  })
})

const suiteFor = (name, monad) => {
  describe(`LazySeqM(${name})`, () => {
    beforeEach(() => {
      inserted = 0
    })

    describe('with normal reduce', () => {
      perfTest('fireAndForget', 2500,
        () => LazySeqM(monad, data)
          .map(transformM)
          .map(insertToDb)
          .take(count / 2)
          .reduce(fireAndForget, Promise.resolve()),
        results => {
          expect(inserted).toEqual(count)
          expect(results).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )

      perfTest('collectAll', 5000,
        () => LazySeqM(monad, data)
          .map(transformM)
          .map(insertToDb)
          .take(count / 2)
          .reduce(collectAll, Promise.resolve([])),
        results => {
          expect(inserted).toEqual(count)
          expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )
      perfTest('collectAllFast', 2500,
        () => LazySeqM(monad, data)
          .map(transformM)
          .map(insertToDb)
          .take(count / 2)
          .reduce(collectAllFast, Promise.resolve([])),
        results => {
          expect(inserted).toEqual(count)
          expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )
    })

    describe('with lazy reduce', () => {
      perfTest('fireAndForget', 150,
        () => LazySeqM(monad, data)
          .map(transformM)
          .map(insertToDb)
          .reduce(fireAndForget, Promise.resolve())
          .take(count / 2),
        results => {
          expect(inserted).toEqual(count)
          expect(results).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )

      perfTest('collectAll', 3900,
        () => LazySeqM(monad, data)
          .map(transformM)
          .map(insertToDb)
          .reduce(collectAll, Promise.resolve([]))
          .take(count / 2),
        results => {
          expect(inserted).toEqual(count)
          expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )

      perfTest('collectAllFast', 150,
        () => LazySeqM(monad, data)
          .map(transformM)
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
}

suiteFor('FlatSequence', monads.FlatSequence)
suiteFor('Something', monads.Something)
