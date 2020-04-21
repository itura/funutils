/* eslint-env jest */

const { LazySequence } = require('./')

describe('LazySequence', () => {
  const data = [1, 2, 3]
  const generator = function * () {
    yield 1
    yield 2
    yield 3
  }
  const sequences = {
    iterator: () => data.values(),
    generator
  }

  Object.entries(sequences).forEach(([name, sequence]) => {
    it(`maps a(n) ${name}`, () => {
      const transform = LazySequence(sequence)
        .map(i => i + 1)

      expect(transform.take(4)).toEqual([2, 3, 4])
      expect(transform.take(3)).toEqual([2, 3, 4])
      expect(transform.take(2)).toEqual([2, 3])
      expect(transform.take(1)).toEqual([2])
      expect(transform.take(0)).toEqual([])

      const transform1 = transform
        .map(i => `${i}`)

      expect(transform1.take(4)).toEqual(['2', '3', '4'])
      expect(transform1.take(3)).toEqual(['2', '3', '4'])
      expect(transform1.take(2)).toEqual(['2', '3'])
      expect(transform1.take(1)).toEqual(['2'])
      expect(transform1.take(0)).toEqual([])
    })

    it(`filters a(n) ${name}`, () => {
      const odds = LazySequence(sequence)
        .filter(i => i % 2 === 1)

      expect(odds.take(4)).toEqual([1, 3])
      expect(odds.take(3)).toEqual([1, 3])
      expect(odds.take(2)).toEqual([1])
      expect(odds.take(1)).toEqual([1])
      expect(odds.take(0)).toEqual([])

      const evenOdder = odds
        .map(i => i + 1)

      expect(evenOdder.take(4)).toEqual([2, 4])
      expect(evenOdder.take(3)).toEqual([2, 4])
      expect(evenOdder.take(2)).toEqual([2])
      expect(evenOdder.take(1)).toEqual([2])
      expect(evenOdder.take(0)).toEqual([])

      const objData = () => [{ key: 'value' }].values()
      const orderedFilter = LazySequence(objData)
        .map(x => ({ anotherKey: x.key }))
        .filter(x => x.anotherKey === 'value')
        .map(x => ({ lastKey: x.anotherKey }))
        .filter(x => x.lastKey === 'value')
        .map(x => x.lastKey)

      expect(orderedFilter.take(2)).toEqual(['value'])
      expect(orderedFilter.take(1)).toEqual(['value'])
      expect(orderedFilter.take(0)).toEqual([])

      const falseyData = () => [null, undefined, NaN, '', [], 0, 1, 2].values()
      const compact = LazySequence(falseyData).compact()

      expect(compact.take(8)).toEqual([0, 1, 2])
    })

    xit(`flattens a(n) ${name}`, () => {
      const arrayData = () => [[1], 2, [], [[3]]].values()
      const flattened = LazySequence(arrayData)
        .flatten() // this illustrates ordering as well as that it only flattens one level
        .flatten()

      expect(flattened.take(4)).toEqual([1, 2, 3])
    })
  })
})
