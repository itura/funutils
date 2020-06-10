/* eslint-env jest */

const array = require('./array')
const { chain } = require('./common')

describe('Array', () => {
  test('Array.prototype aliases', () => {
    const data = chain([1, 2, 3])

    expect(data(
      array.concat(4, 5),
      array.concat([6, 7])
    )).toEqual(
      [1, 2, 3, 4, 5, 6, 7]
    )

    expect(data(
      array.every(Number.isInteger)
    )).toEqual(
      true
    )

    expect(data(
      array.every(x => x === 1)
    )).toEqual(
      false
    )

    expect(data(
      array.filter(x => x % 2 === 0)
    )).toEqual(
      [2]
    )

    expect(data(
      array.find(x => x * 3 === 6)
    )).toEqual(
      2
    )

    expect(data(
      array.findIndex(x => x * 3 === 6)
    )).toEqual(
      1
    )

    expect(data(
      array.flatten()
    )).toEqual(
      [1, 2, 3]
    )

    expect(data(
      array.map(x => [x, x]),
      array.flatten()
    )).toEqual(
      [1, 1, 2, 2, 3, 3]
    )

    expect(data(
      array.includes(3)
    )).toEqual(
      true
    )

    expect(data(
      array.indexOf(2)
    )).toEqual(
      1
    )

    expect(data(
      array.join('🤓')
    )).toEqual(
      '1🤓2🤓3'
    )

    expect(data(
      array.map(x => `${x}🤓 `),
      array.reduce((acc, x) => acc + x)
    )).toEqual(
      '1🤓 2🤓 3🤓 '
    )

    expect(data(
      array.map(x => `${x}🤓 `),
      array.reduce((acc, x) => acc + x, 'hi ')
    )).toEqual(
      'hi 1🤓 2🤓 3🤓 '
    )

    expect(data(
      array.map(x => `${x}🤓 `),
      array.reduceRight((acc, x) => acc + x)
    )).toEqual(
      '3🤓 2🤓 1🤓 '
    )

    expect(data(
      array.map(x => `${x}🤓 `),
      array.reduceRight((acc, x) => acc + x, 'hi ')
    )).toEqual(
      'hi 3🤓 2🤓 1🤓 '
    )

    expect(data(
      array.slice(2)
    )).toEqual(
      [3]
    )

    expect(data(
      array.slice(0, 2)
    )).toEqual(
      [1, 2]
    )

    expect(data(
      array.some(x => x % 2 === 0)
    )).toEqual(
      true
    )

    expect(data(
      array.map(x => x % 2 === 0 ? null : x),
      array.compact()
    )).toEqual(
      [1, 3]
    )
  })

  describe('sort', () => {
    it('sorts with or without a comparator', () => {
      expect(chain([3, 2, 1])(
        array.sort()
      )).toEqual(
        [1, 2, 3]
      )

      expect(chain([1, 2, 3])(
        array.sort((a, b) => b - a)
      )).toEqual(
        [3, 2, 1]
      )
    })

    it('mutates the array', () => {
      const data = [3, 2, 1]

      expect(chain(data)(
        array.sort()
      )).toEqual(
        [1, 2, 3]
      )

      expect(data).toEqual([1, 2, 3])
    })
  })

  test('handy dandy reducers', () => {
    const numbers = chain([1, 2, 3])
    expect(numbers(
      array.sum()
    )).toEqual(
      6
    )

    expect(numbers(
      array.sum(3)
    )).toEqual(
      9
    )

    expect(numbers(
      array.map(x => `${x}!`),
      array.buildLines()
    )).toEqual(
      '1!\n2!\n3!'
    )

    expect(numbers(
      array.map(x => `${x}!`),
      array.buildLines('hi')
    )).toEqual(
      'hi\n1!\n2!\n3!'
    )
  })

  describe('reverse', () => {
    it('mutates the array', () => {
      const data = [1, 2, 3]

      expect(chain(data)(
        array.reverse()
      )).toEqual(
        [3, 2, 1]
      )

      expect(data).toEqual([3, 2, 1])
    })
  })
})
