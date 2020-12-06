/* eslint-env jest */

const maybe = require('./maybe')
const { compose } = require('./common')

describe('maybe', () => {
  it('do', () => {
    const nothing = maybe.Nothing()
    const just = maybe.Just('hi')
    const id = x => x

    expect(nothing.map(id)).toStrictEqual(maybe.Nothing())
    expect(just.map(id)).toStrictEqual(maybe.Just('hi'))

    expect(maybe.Maybe('hi')).toStrictEqual(maybe.Just('hi'))
    expect(maybe.Maybe([])).toStrictEqual(maybe.Just([]))
    expect(maybe.Maybe(null)).toStrictEqual(maybe.Nothing())
    expect(maybe.Maybe(undefined)).toStrictEqual(maybe.Nothing())
  })

  it('is a functor', () => {
    const just = maybe.Just(8)
    const nothing = maybe.Nothing()
    const g = x => x - 9
    const f = x => x * 2

    expect(just.map(compose(f)(g)))
      .toStrictEqual(just.map(g).map(f))
    expect(nothing.map(compose(f)(g)))
      .toStrictEqual(nothing.map(g).map(f))
    expect(just.map(() => undefined)).toStrictEqual(maybe.Nothing())
    expect(just.map(x => x + 1)).toStrictEqual(maybe.Just(9))
    expect(just.map(x => maybe.Just(x + 1))).toStrictEqual(maybe.Just(9))
  })

  const m1 = maybe.Just('hi')
  const m2 = maybe.Just('there')
  const m3 = maybe.Nothing()

  describe('caseMap', () => {
    const cases = {
      just: v => v + '!',
      nothing: () => 'bye'
    }

    describe('when value is a Just', () => {
      it('applies the just case', () => {
        expect(maybe.caseMap(cases)(m1)).toEqual('hi!')
        expect(m1.caseMap(cases)).toEqual('hi!')
      })

      it('unwraps the value by default', () => {
        expect(maybe.caseMap({})(m1)).toEqual('hi')
        expect(m1.caseMap({})).toEqual('hi')
      })
    })

    describe('when value is a Nothing', () => {
      it('applies the nothing case', () => {
        expect(maybe.caseMap(cases)(m3)).toEqual('bye')
        expect(m3.caseMap(cases)).toEqual('bye')
      })

      it('throws an error when no error case is given', () => {
        expect(() => maybe.caseMap({})(m3)).toThrow('funutils.maybe: unhandled Nothing')
        expect(() => m3.caseMap({})).toThrow('funutils.maybe: unhandled Nothing')
      })
    })
  })

  describe('given', () => {
    it('applies the function when all Maybes are Justs', () => {
      expect(
        maybe.given(m1, m2)((v1, v2) => `${v1} ${v2}`)
      ).toEqual(
        maybe.Just('hi there')
      )
    })

    it('returns Nothing when any Maybe is Nothing', () => {
      expect(
        maybe.given(m1, m2, m3)(() => 'hi there')
      ).toEqual(
        maybe.Nothing()
      )
    })
  })

  describe('none', () => {
    it('applies the function when all Maybes are Nothing', () => {
      expect(
        maybe.none(m3, maybe.Nothing())(() => 'hi there')
      ).toEqual(
        maybe.Just('hi there')
      )
    })

    it('returns Nothing when any Maybe is Just', () => {
      expect(
        maybe.none(m3, m2, maybe.Nothing())(() => 'hi there')
      ).toEqual(
        maybe.Nothing()
      )
    })
  })

  describe('cases', () => {
    it('executes the effect of the first true condition', () => {
      expect(maybe.cases(
        [false, () => 1],
        [true, () => 2],
        [true, () => 3]
      )).toEqual(maybe.Just(2))
    })

    it('returns Nothing when none of the cases are true', () => {
      expect(maybe.cases(
        [false, () => 1],
        [false, () => 2],
        [false, () => 3]
      )).toEqual(maybe.Nothing())
    })

    it('nests cases', () => {
      expect(maybe.cases(
        [false, [
          [true, () => 1]
        ]],
        [true, [
          [false, () => 2],
          [true, () => 3]
        ]]
      )).toEqual(maybe.Just(3))
    })

    it('nests cases when none of the conditions are true', () => {
      expect(maybe.cases(
        [false, [
          [false, () => 1]
        ]],
        [false, [
          [false, () => 2],
          [false, () => 3]
        ]]
      )).toEqual(maybe.Nothing())
    })
  })

  describe('dig', () => {
    const testObj = {
      key: 'value',
      nested: { key: 'nestedValue' },
      array: ['arrayValue']
    }

    it('safely accesses objects', () => {
      expect(maybe.dig(testObj, 'key')).toEqual(maybe.Just('value'))
      expect(maybe.dig(testObj, 'nested', 'key')).toEqual(maybe.Just('nestedValue'))
      expect(maybe.dig(testObj, 'beep')).toEqual(maybe.Nothing())
      expect(maybe.dig(testObj, 'beep', 'boop')).toEqual(maybe.Nothing())

      expect(maybe.dig(testObj, 'array')).toEqual(maybe.Just(['arrayValue']))
      expect(maybe.dig(testObj, 'array', 0)).toEqual(maybe.Just('arrayValue'))
      expect(maybe.dig(testObj, 'array', 1)).toEqual(maybe.Nothing())
    })

    it('safely accesses arrays', () => {
      const array = ['1', '2']
      expect(maybe.dig(array, 0)).toEqual(maybe.Just('1'))
      expect(maybe.dig(array, 2)).toEqual(maybe.Nothing())
      expect(maybe.dig(array, 'hi')).toEqual(maybe.Nothing())
      expect(maybe.dig([], 'hi')).toEqual(maybe.Nothing())
    })

    it('safely access strings', () => {
      expect(maybe.dig('hi', 0)).toEqual(maybe.Just('h'))
      expect(maybe.dig('hi', 2)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi', 'bye')).toEqual(maybe.Nothing())
    })

    it('safely accesses things without keys', () => {
      expect(maybe.dig(null, 'hi')).toEqual(maybe.Nothing())
      expect(maybe.dig(null, 1)).toEqual(maybe.Nothing())
      expect(maybe.dig(undefined, 'hi')).toEqual(maybe.Nothing())
      expect(maybe.dig(undefined, 1)).toEqual(maybe.Nothing())
      expect(maybe.dig(0, 'hi')).toEqual(maybe.Nothing())
      expect(maybe.dig(0, 1)).toEqual(maybe.Nothing())
      expect(maybe.dig(true, 1)).toEqual(maybe.Nothing())
      expect(maybe.dig(true, 'hi')).toEqual(maybe.Nothing())
      expect(maybe.dig(false, 1)).toEqual(maybe.Nothing())
      expect(maybe.dig(false, 'hi')).toEqual(maybe.Nothing())
    })

    it('safely accesses maybes', () => {
      expect(maybe.dig(maybe.Nothing(), 0)).toEqual(maybe.Nothing())
      expect(maybe.dig(maybe.Nothing(), 'hi')).toEqual(maybe.Nothing())
      expect(maybe.dig(maybe.Maybe(null), 'hi')).toEqual(maybe.Nothing())

      const obj = maybe.Just(testObj)

      expect(maybe.dig(obj, 'key')).toEqual(maybe.Just('value'))
      expect(maybe.dig(obj, 'nested', 'key')).toEqual(maybe.Just('nestedValue'))
      expect(maybe.dig(obj, 'beep')).toEqual(maybe.Nothing())
      expect(maybe.dig(obj, 'beep', 'boop')).toEqual(maybe.Nothing())

      expect(maybe.dig(obj, 'array')).toEqual(maybe.Just(['arrayValue']))
      expect(maybe.dig(obj, 'array', 0)).toEqual(maybe.Just('arrayValue'))
      expect(maybe.dig(obj, 'array', 1)).toEqual(maybe.Nothing())

      const array = maybe.Just(['1', '2'])
      expect(maybe.dig(array, 0)).toEqual(maybe.Just('1'))
      expect(maybe.dig(array, 2)).toEqual(maybe.Nothing())
      expect(maybe.dig(array, 'hi')).toEqual(maybe.Nothing())
      expect(maybe.dig([], 'hi')).toEqual(maybe.Nothing())

      const string = maybe.Just('hi')
      expect(maybe.dig(string, 0)).toEqual(maybe.Just('h'))
      expect(maybe.dig(string, 2)).toEqual(maybe.Nothing())
      expect(maybe.dig(string, 'bye')).toEqual(maybe.Nothing())
    })
  })
})
