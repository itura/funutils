/* eslint-env jest */

const Maybe = require('./maybe')

describe('Maybe', () => {
  it('do', () => {
    const nothing = Maybe.Nothing
    const just = Maybe.Just('hi')
    const id = x => x

    expect(nothing.map(id)).toStrictEqual(Maybe.Nothing)
    expect(just.map(id)).toStrictEqual(Maybe.Just('hi'))
  })
  it('preserves composition of morphisms', () => {
    const just = Maybe.Just(8)
    const nothing = Maybe.Nothing
    const g = x => x - 9
    const f = x => x * 2

    expect(just.map(x => f(g(x)))).toStrictEqual(just.map(g).map(f))
    expect(nothing.map(x => f(g(x)))).toStrictEqual(nothing.map(g).map(f))
  })
})
