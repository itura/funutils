/* eslint-env jest */

const array = require('./array')
const { chain } = require('./common')

describe('Array', () => {
  test('Array.prototype aliases', () => {
    const data = [1, 2, 3]

    expect(chain(
      array.concat(4, 5),
      array.concat([6, 7])
    )(data)).toEqual(
      [1, 2, 3, 4, 5, 6, 7]
    )

    expect(chain(
      array.every(Number.isInteger)
    )(data)).toEqual(
      true
    )

    expect(chain(
      array.every(x => x === 1)
    )(data)).toEqual(
      false
    )

    expect(chain(
      array.filter(x => x % 2 === 0)
    )(data)).toEqual(
      [2]
    )

    expect(chain(
      array.find(x => x * 3 === 6)
    )(data)).toEqual(
      2
    )

    expect(chain(
      array.findIndex(x => x * 3 === 6)
    )(data)).toEqual(
      1
    )

    expect(chain(
      array.flatten()
    )(data)).toEqual(
      [1, 2, 3]
    )

    expect(chain(
      array.map(x => [x, x]),
      array.flatten()
    )(data)).toEqual(
      [1, 1, 2, 2, 3, 3]
    )

    expect(chain(
      array.includes(3)
    )(data)).toEqual(
      true
    )

    expect(chain(
      array.indexOf(2)
    )(data)).toEqual(
      1
    )

    expect(chain(
      array.join('🤓')
    )(data)).toEqual(
      '1🤓2🤓3'
    )

    expect(chain(
      array.map(x => `${x}🤓 `),
      array.reduce((acc, x) => acc + x)
    )(data)).toEqual(
      '1🤓 2🤓 3🤓 '
    )

    expect(chain(
      array.map(x => `${x}🤓 `),
      array.reduce((acc, x) => acc + x, 'hi ')
    )(data)).toEqual(
      'hi 1🤓 2🤓 3🤓 '
    )

    expect(chain(
      array.map(x => `${x}🤓 `),
      array.reduceRight((acc, x) => acc + x)
    )(data)).toEqual(
      '3🤓 2🤓 1🤓 '
    )

    expect(chain(
      array.map(x => `${x}🤓 `),
      array.reduceRight((acc, x) => acc + x, 'hi ')
    )(data)).toEqual(
      'hi 3🤓 2🤓 1🤓 '
    )

    expect(chain(
      array.slice(2)
    )(data)).toEqual(
      [3]
    )

    expect(chain(
      array.slice(0, 2)
    )(data)).toEqual(
      [1, 2]
    )

    expect(chain(
      array.some(x => x % 2 === 0)
    )(data)).toEqual(
      true
    )

    expect(chain(
      array.map(x => x % 2 === 0 ? null : x),
      array.compact()
    )(data)).toEqual(
      [1, 3]
    )

    expect(chain(
      array.reverse()
    )(data)).toEqual(
      [3, 2, 1]
    )
  })

  describe('sort', () => {
    it('sorts with or without a comparator', () => {
      expect(chain(
        array.sort()
      )([3, 2, 1])).toEqual(
        [1, 2, 3]
      )

      expect(chain(
        array.sort((a, b) => b - a)
      )([1, 2, 3])).toEqual(
        [3, 2, 1]
      )
    })
  })

  test('handy dandy reducers', () => {
    const numbers = [1, 2, 3]
    expect(chain(
      array.sum()
    )(numbers)).toEqual(
      6
    )

    expect(chain(
      array.sum(3)
    )(numbers)).toEqual(
      9
    )

    expect(chain(
      array.map(x => `${x}!`),
      array.buildLines()
    )(numbers)).toEqual(
      '1!\n2!\n3!'
    )

    expect(chain(
      array.map(x => `${x}!`),
      array.buildLines('hi')
    )(numbers)).toEqual(
      'hi\n1!\n2!\n3!'
    )
  })
})
