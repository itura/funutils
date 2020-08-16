/* eslint-env jest */

const LazySeqM = require('./LazySeqM')
const LazySeq = require('./LazySeq')
const monads = require('../monads')
const { time } = require('../perf')

const count = 24000

const perfTest = (title, expectedDuration, action, check, t = test) => {
  t(`${expectedDuration}#${title}`, async () => {
    const [duration, results] = await time(action)

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

let inserted
const insertToDb = data => {
  inserted++
  const result = `Inserted ${data}`
  return Promise.resolve(result)
}

describe('LazySeq', () => {
  beforeEach(() => {
    inserted = 0
  })

  describe('with normal reduce', () => {
    perfTest('fireAndForget', 2400,
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

    perfTest('fireAndForget with filter', 600,
      () => LazySeq()
        .map(x => x + 1)
        .filter(x => x % 2 === 0)
        .map(insertToDb)
        .take(count)
        .reduce(fireAndForget, Promise.resolve()),
      results => {
        expect(inserted).toEqual(count / 2)
        expect(results).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAll', 6200,
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

    perfTest('collectAll with filter', 2200,
      () => LazySeq()
        .map(x => x + 1)
        .filter(x => x % 2 === 0)
        .map(insertToDb)
        .take(count)
        .reduce(collectAll, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count / 2)
        expect(results[count / 2 - 1]).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAllFast', 2600,
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

    perfTest('collectAllFast with filter', 600,
      () => LazySeq()
        .map(x => x + 1)
        .filter(x => x % 2 === 0)
        .map(insertToDb)
        .take(count)
        .reduce(collectAllFast, Promise.resolve([])),
      results => {
        expect(inserted).toEqual(count / 2)
        expect(results[count / 2 - 1]).toEqual(`Inserted ${count}`)
      }
    )
  })

  describe('with lazy reduce', () => {
    perfTest('fireAndForget', 60,
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

    perfTest('fireAndForget with filter', 60,
      () => LazySeq()
        .map(x => x + 1)
        .filter(x => x % 2 === 0)
        .map(insertToDb)
        .reduce(fireAndForget, Promise.resolve())
        .take(count),
      results => {
        expect(inserted).toEqual(count / 2)
        expect(results).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAll', 3800,
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

    perfTest('collectAll with filter', 1000,
      () => LazySeq()
        .map(x => x + 1)
        .filter(x => x % 2 === 0)
        .map(insertToDb)
        .reduce(collectAll, Promise.resolve([]))
        .take(count),
      results => {
        expect(inserted).toEqual(count / 2)
        expect(results[count / 2 - 1]).toEqual(`Inserted ${count}`)
      }
    )

    perfTest('collectAllFast', 100,
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

    perfTest('collectAllFast with filter', 100,
      () => LazySeq()
        .map(x => x + 1)
        .filter(x => x % 2 === 0)
        .map(insertToDb)
        .reduce(collectAllFast, Promise.resolve([]))
        .take(count),
      results => {
        expect(inserted).toEqual(count / 2)
        expect(results[count / 2 - 1]).toEqual(`Inserted ${count}`)
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
        () => LazySeqM(monad)
          .map(x => [x + 1, x + 2])
          .map(insertToDb)
          .take(count / 2)
          .reduce(fireAndForget, Promise.resolve()),
        results => {
          expect(inserted).toEqual(count)
          expect(results).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )

      perfTest('collectAll', 6000,
        () => LazySeqM(monad)
          .map(x => [x + 1, x + 2])
          .map(insertToDb)
          .take(count / 2)
          .reduce(collectAll, Promise.resolve([])),
        results => {
          expect(inserted).toEqual(count)
          expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )
      perfTest('collectAllFast', 2500,
        () => LazySeqM(monad)
          .map(x => [x + 1, x + 2])
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
        () => LazySeqM(monad)
          .map(x => [x + 1, x + 2])
          .map(insertToDb)
          .reduce(fireAndForget, Promise.resolve())
          .take(count / 2),
        results => {
          expect(inserted).toEqual(count)
          expect(results).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )

      perfTest('collectAll', 3900,
        () => LazySeqM(monad)
          .map(x => [x + 1, x + 2])
          .map(insertToDb)
          .reduce(collectAll, Promise.resolve([]))
          .take(count / 2),
        results => {
          expect(inserted).toEqual(count)
          expect(results[count - 1]).toEqual(`Inserted ${count / 2 + 1}`)
        }
      )

      perfTest('collectAllFast', 150,
        () => LazySeqM(monad)
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
}

suiteFor('FlatSequence', monads.FlatSequence)
suiteFor('Something', monads.Something)
