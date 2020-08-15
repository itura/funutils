/* eslint-env jest */

const maybe = require('./maybe')
const { compose } = require('./common')

describe('maybe', () => {
  it('do', () => {
    const nothing = maybe.Nothing
    const just = maybe.Just('hi')
    const id = x => x

    expect(nothing.map(id)).toStrictEqual(maybe.Nothing)
    expect(just.map(id)).toStrictEqual(maybe.Just('hi'))

    expect(maybe.Maybe('hi')).toEqual(maybe.Just('hi'))
    expect(maybe.Maybe([])).toEqual(maybe.Just([]))
    expect(maybe.Maybe(null)).toEqual(maybe.Nothing)
    expect(maybe.Maybe(undefined)).toEqual(maybe.Nothing)
  })

  it('is a functor', () => {
    const just = maybe.Just(8)
    const nothing = maybe.Nothing
    const g = x => x - 9
    const f = x => x * 2

    expect(just.map(compose(f)(g)))
      .toStrictEqual(just.map(g).map(f))
    expect(nothing.map(compose(f)(g)))
      .toStrictEqual(nothing.map(g).map(f))
  })
})
