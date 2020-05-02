/* eslint-env jest */

const Maybe = require('./maybe')
const { compose } = require('./common')

describe('Maybe', () => {
  it('do', () => {
    const nothing = Maybe.Nothing
    const just = Maybe.Just('hi')
    const id = x => x

    expect(nothing.map(id)).toStrictEqual(Maybe.Nothing)
    expect(just.map(id)).toStrictEqual(Maybe.Just('hi'))

    expect(Maybe.Maybe('hi')).toEqual(Maybe.Just('hi'))
    expect(Maybe.Maybe([])).toEqual(Maybe.Just([]))
    expect(Maybe.Maybe(null)).toEqual(Maybe.Nothing)
    expect(Maybe.Maybe(undefined)).toEqual(Maybe.Nothing)
  })

  it('is a functor', () => {
    const just = Maybe.Just(8)
    const nothing = Maybe.Nothing
    const g = x => x - 9
    const f = x => x * 2

    expect(just.map(compose(f, g)))
      .toStrictEqual(just.map(g).map(f))
    expect(nothing.map(compose(f, g)))
      .toStrictEqual(nothing.map(g).map(f))
  })
})
