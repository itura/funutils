/* eslint-env jest */

const generators = require('./generators')
const { repeat } = require('./common')

const results = (generator) => {
  const results = []
  for (const r of generator) {
    results.push(r)
  }
  return results
}

describe('generators', () => {
  describe('integers', () => {
    it('returns integers increasing by 1 starting at zero', () => {
      const iterator = generators.integers()
      expect(
        repeat(3, () => iterator.next())
      ).toEqual([
        { value: 0, done: false },
        { value: 1, done: false },
        { value: 2, done: false }
      ])
    })

    it('returns integers increasing by 1 starting at zero, stopping at stop', () => {
      expect(
        results(generators.integers({ stop: 3 })))
        .toEqual([0, 1, 2])
    })

    it('returns integers increasing by 1 starting at start', () => {
      expect(
        results(generators.integers({ start: -1, stop: 3 }))
      ).toEqual([-1, 0, 1, 2])
    })

    it('returns integers increasing by step', () => {
      expect(
        results(generators.integers({ start: -1, step: 2, stop: 4 }))
      ).toEqual([-1, 1, 3])
    })

    it('does nothing when start is greater than stop', () => {
      expect(
        results(generators.integers({ start: 10, stop: 1 }))
      ).toEqual([])
    })

    it('does nothing when step is negative', () => {
      expect(results(generators.integers({ step: -1 }))).toEqual([])
    })
  })

  describe('zip', () => {
    it('zips none', () => {
      const gen = generators.zip()

      expect(results(gen)).toEqual([])
    })

    it('zips one', () => {
      const gen = generators.zip([1, 2])

      expect(results(gen)).toEqual([
        [1, 2]
      ])
    })

    it('zips two', () => {
      const gen = generators.zip([1, 2], ['a', 'b'])

      expect(results(gen)).toEqual([
        [1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']
      ])
    })

    it('zips three', () => {
      const gen = generators.zip([1, 2], ['a', 'b'], [3, 4])

      expect(results(gen)).toEqual([
        [1, 'a', 3], [1, 'a', 4], [1, 'b', 3], [1, 'b', 4],
        [2, 'a', 3], [2, 'a', 4], [2, 'b', 3], [2, 'b', 4]
      ])
    })
  })
})
