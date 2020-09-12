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

    expect(just.caseMap({
      just: v => v + '!',
      nothing: () => 'bye'
    })).toEqual('hi!')

    expect(nothing.caseMap({
      just: v => v + '!',
      nothing: () => 'bye'
    })).toEqual('bye')
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
  })
})
