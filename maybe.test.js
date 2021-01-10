/* eslint-env jest */

const maybe = require('./maybe')
const { id, chain, compose, lessThan, greaterThanOrEqualTo, greaterThan, equalTo } = require('./common')

describe('maybe', () => {
  it('do', () => {
    expect(maybe.Just('hi').map(id)).toStrictEqual(maybe.Just('hi'))
    expect(maybe.Nothing().map(id)).toStrictEqual(maybe.Nothing())

    const transform = chain(
      maybe.Maybe,
      maybe.map(x => x.toString()),
      maybe.map(x => x.repeat(2)),
      maybe.map(x => x + ':)'),
      maybe.unwrapOr(() => ':(')
    )

    expect(transform(1)).toEqual('11:)')
    expect(transform(maybe.Just(1))).toEqual('11:)')
    expect(transform(null)).toEqual(':(')
    expect(transform(maybe.Nothing())).toEqual(':(')

    const transform1 = chain(
      maybe.Maybe,
      maybe.map(chain(
        x => x.toString(),
        x => x.repeat(2),
        x => x + ':)'
      )),
      maybe.unwrapOr(() => ':(')
    )

    expect(transform1(1)).toEqual(transform(1))
    expect(transform1(null)).toEqual(transform(null))

    const transform2 = chain(
      maybe.dig('key'),
      maybe.map(x => x + '!'),
      maybe.map(x => x.length),
      maybe.unwrapOr(() => -1)
    )

    expect(transform2({ key: 'hi' })).toEqual(3)
    expect(transform2({ key: 'hello' })).toEqual(6)
    expect(transform2({ woops: 'hello' })).toEqual(-1)
    expect(transform2({ key: null })).toEqual(-1)
    expect(transform2({ notKey: 'hi' })).toEqual(-1)
    expect(transform2(null)).toEqual(-1)
    expect(transform2()).toEqual(-1)

    expect(
      maybe.Maybe({ key: 'hi' })
        .dig('key')
        .map(x => x + '!')
        .map(x => x.length)
        .unwrapOr(() => -1)
    ).toEqual(3)

    expect(
      maybe.Maybe({ key: 'hi' })
        .dig('woops')
        .map(x => x + '!')
        .map(x => x.length)
        .unwrapOr(() => -1)
    ).toEqual(-1)
  })

  it('can be constructed with Maybe', () => {
    expect(maybe.Maybe('hi')).toStrictEqual(maybe.Just('hi'))
    expect(maybe.Maybe({})).toStrictEqual(maybe.Just({}))
    expect(maybe.Maybe(true)).toStrictEqual(maybe.Just(true))
    expect(maybe.Maybe(0)).toStrictEqual(maybe.Just(0))
    expect(maybe.Maybe(-0)).toStrictEqual(maybe.Just(-0))
    expect(maybe.Maybe([])).toStrictEqual(maybe.Just([]))
    expect(maybe.Maybe('')).toStrictEqual(maybe.Just(''))
    expect(maybe.Maybe(0n)).toStrictEqual(maybe.Just(0n))
    expect(maybe.Maybe(NaN)).toStrictEqual(maybe.Just(NaN))
    expect(maybe.Maybe(false)).toStrictEqual(maybe.Just(false))
    expect(maybe.Maybe(null)).toStrictEqual(maybe.Nothing())
    expect(maybe.Maybe(undefined)).toStrictEqual(maybe.Nothing())
  })

  it('can be constructed with Truthy', () => {
    expect(maybe.Truthy('hi')).toStrictEqual(maybe.Just('hi'))
    expect(maybe.Truthy({})).toStrictEqual(maybe.Just({}))
    expect(maybe.Truthy(true)).toStrictEqual(maybe.Just(true))
    expect(maybe.Truthy(0)).toStrictEqual(maybe.Nothing())
    expect(maybe.Truthy(-0)).toStrictEqual(maybe.Nothing())
    expect(maybe.Truthy([])).toStrictEqual(maybe.Just([]))
    expect(maybe.Truthy('')).toStrictEqual(maybe.Nothing())
    expect(maybe.Truthy(0n)).toStrictEqual(maybe.Nothing())
    expect(maybe.Truthy(NaN)).toStrictEqual(maybe.Nothing())
    expect(maybe.Truthy(false)).toStrictEqual(maybe.Nothing())
    expect(maybe.Truthy(null)).toStrictEqual(maybe.Nothing())
    expect(maybe.Truthy(undefined)).toStrictEqual(maybe.Nothing())
  })

  it('is a functor', () => {
    const just = maybe.Just(8)
    const nothing = maybe.Nothing()
    const g = x => x - 9
    const f = x => x * 2

    expect(just.map(compose(f)(g))).toStrictEqual(just.map(g).map(f))
    expect(nothing.map(compose(f)(g))).toStrictEqual(nothing.map(g).map(f))
    expect(just.map(() => undefined)).toStrictEqual(maybe.Nothing())
    expect(just.map(x => x + 1)).toStrictEqual(maybe.Just(9))
    expect(just.map(x => maybe.Just(x + 1))).toStrictEqual(maybe.Just(9))
  })

  const m1 = maybe.Just('hi')
  const m2 = maybe.Just('there')
  const m3 = maybe.Nothing()

  describe('map', () => {
    describe('when value is a Just', () => {
      it('applies the given function', () => {
        expect(maybe.map(x => x + '!')(m1)).toEqual(maybe.Just('hi!'))
        expect(maybe.map(x => maybe.Just(x + '!'))(m1)).toEqual(maybe.Just('hi!'))
      })
    })

    describe('when value is a Nothing', () => {
      it('returns Nothing', () => {
        expect(maybe.map(x => x + '!')(m3)).toEqual(maybe.Nothing())
      })
    })
  })

  describe('unwrap', () => {
    const cases = {
      just: v => v + '!',
      nothing: () => 'bye'
    }

    describe('when value is a Just', () => {
      it('applies the just case', () => {
        expect(maybe.unwrap(cases)(m1)).toEqual('hi!')
        expect(m1.unwrap(cases)).toEqual('hi!')
      })

      it('unwraps the value by default', () => {
        expect(maybe.unwrap({})(m1)).toEqual('hi')
        expect(m1.unwrap({})).toEqual('hi')
      })
    })

    describe('when value is a Nothing', () => {
      it('applies the nothing case', () => {
        expect(maybe.unwrap(cases)(m3)).toEqual('bye')
        expect(m3.unwrap(cases)).toEqual('bye')
      })

      it('throws an error when no error case is given', () => {
        expect(() => maybe.unwrap({})(m3)).toThrow('funutils.maybe: unhandled Nothing')
        expect(() => m3.unwrap({})).toThrow('funutils.maybe: unhandled Nothing')
      })
    })
  })

  describe('toBoolean', () => {
    expect(maybe.toBoolean(maybe.Just('hi'))).toEqual(true)
    expect(maybe.Just('hi').toBoolean()).toEqual(true)
    expect(maybe.toBoolean(maybe.Nothing())).toEqual(false)
    expect(maybe.Nothing().toBoolean()).toEqual(false)
  })

  describe('given', () => {
    it('applies the function when all Maybes are Justs', () => {
      expect(
        maybe.given(m1, m2)((v1, v2) => `${v1} ${v2}`)
      ).toEqual(
        maybe.Just('hi there')
      )

      expect(
        maybe.given(m1, m2)((v1, v2) => null)
      ).toEqual(
        maybe.Nothing()
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

      expect(
        maybe.none(m3, maybe.Nothing())(() => null)
      ).toEqual(
        maybe.Nothing()
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
      expect(maybe.conditions(
        [equalTo(1), x => x + 1],
        [equalTo(2), x => x + 2],
        [greaterThan(1), x => x + 3]
      )(2)).toEqual(maybe.Just(4))
    })

    it('returns Nothing when none of the cases are true', () => {
      expect(maybe.conditions(
        [() => false, () => 1],
        [() => false, () => 2],
        [() => false, () => 3]
      )(1)).toEqual(maybe.Nothing())
    })

    it('nests cases', () => {
      expect(maybe.conditions(
        [lessThan(3), [
          [() => true, () => 1]
        ]],
        [greaterThanOrEqualTo(3), [
          [greaterThan(5), () => 2],
          [lessThan(5), x => x + 3]
        ]]
      )(3)).toEqual(maybe.Just(6))

      expect(maybe.conditions(
        [lessThan(3), maybe.conditions(
          [() => true, () => 1]
        )],
        [greaterThanOrEqualTo(3), maybe.conditions(
          [greaterThan(5), () => 2],
          [lessThan(5), x => x + 3]
        )]
      )(3)).toEqual(maybe.Just(6))
    })

    it('nests cases when none of the conditions are true', () => {
      expect(maybe.conditions(
        [() => false, [
          [() => false, () => 1]
        ]],
        [() => false, [
          [() => false, () => 2],
          [() => false, () => 3]
        ]]
      )(1)).toEqual(maybe.Nothing())

      expect(maybe.conditions(
        [lessThan(3), maybe.conditions(
          [() => true, () => 1]
        )],
        [greaterThanOrEqualTo(3), maybe.conditions(
          [() => false, () => 2],
          [() => false, x => x + 3]
        )]
      )(3)).toEqual(maybe.Nothing())
    })
  })

  describe('dig', () => {
    const testObj = {
      key: 'value',
      nested: { key: 'nestedValue' },
      array: ['arrayValue']
    }

    it('safely accesses objects', () => {
      expect(maybe.dig('key')(testObj)).toEqual(maybe.Just('value'))
      expect(maybe.dig('nested', 'key')(testObj)).toEqual(maybe.Just('nestedValue'))
      expect(maybe.dig('beep')(testObj)).toEqual(maybe.Nothing())
      expect(maybe.dig('beep', 'boop')(testObj)).toEqual(maybe.Nothing())

      expect(maybe.dig('array')(testObj)).toEqual(maybe.Just(['arrayValue']))
      expect(maybe.dig('array', 0)(testObj)).toEqual(maybe.Just('arrayValue'))
      expect(maybe.dig('array', 1)(testObj)).toEqual(maybe.Nothing())
    })

    it('safely accesses arrays', () => {
      const array = ['1', '2']
      expect(maybe.dig(0)(array)).toEqual(maybe.Just('1'))
      expect(maybe.dig(2)(array)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')(array)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')([])).toEqual(maybe.Nothing())
    })

    it('safely access strings', () => {
      expect(maybe.dig(0)('hi')).toEqual(maybe.Just('h'))
      expect(maybe.dig(2)('hi')).toEqual(maybe.Nothing())
      expect(maybe.dig('bye')('hi')).toEqual(maybe.Nothing())
    })

    it('safely accesses things without keys', () => {
      expect(maybe.dig('hi')(null)).toEqual(maybe.Nothing())
      expect(maybe.dig(1)(null)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')(undefined)).toEqual(maybe.Nothing())
      expect(maybe.dig(1)(undefined)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')(0)).toEqual(maybe.Nothing())
      expect(maybe.dig(1)(0)).toEqual(maybe.Nothing())
      expect(maybe.dig(1)(true)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')(true)).toEqual(maybe.Nothing())
      expect(maybe.dig(1)(false)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')(false)).toEqual(maybe.Nothing())
    })

    it('safely accesses maybes', () => {
      expect(maybe.Just('hi').dig(0)).toEqual(maybe.Just('h'))
      expect(maybe.Nothing().dig(0)).toEqual(maybe.Nothing())

      expect(maybe.dig(0)(maybe.Nothing())).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')(maybe.Nothing())).toEqual(maybe.Nothing())

      const obj = maybe.Just(testObj)

      expect(maybe.dig('key')(obj)).toEqual(maybe.Just('value'))
      expect(maybe.dig('nested', 'key')(obj)).toEqual(maybe.Just('nestedValue'))
      expect(maybe.dig('beep')(obj)).toEqual(maybe.Nothing())
      expect(maybe.dig('beep', 'boop')(obj)).toEqual(maybe.Nothing())

      expect(maybe.dig('array')(obj)).toEqual(maybe.Just(['arrayValue']))
      expect(maybe.dig('array', 0)(obj)).toEqual(maybe.Just('arrayValue'))
      expect(maybe.dig('array', 1)(obj)).toEqual(maybe.Nothing())

      const array = maybe.Just(['1', '2'])
      expect(maybe.dig(0)(array)).toEqual(maybe.Just('1'))
      expect(maybe.dig(2)(array)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')(array)).toEqual(maybe.Nothing())
      expect(maybe.dig('hi')([])).toEqual(maybe.Nothing())

      const string = maybe.Just('hi')
      expect(maybe.dig(0)(string)).toEqual(maybe.Just('h'))
      expect(maybe.dig(2)(string)).toEqual(maybe.Nothing())
      expect(maybe.dig('bye')(string)).toEqual(maybe.Nothing())
    })
  })
})
