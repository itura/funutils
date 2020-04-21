const bind = require('./bind.js')

describe('Nil', () => {
  it('is almost es6 falsey but not quite', () => {
    const fn = x => x
    const result = initial =>
      bind.domonad(bind.NilMonad, [fn], initial)

    expect(result(0)).toEqual(0)
    expect(result(bind.Nil)).toEqual(bind.Nil)
    expect(result(null)).toEqual(bind.Nil)
    expect(result(undefined)).toEqual(bind.Nil)
    expect(result([])).toEqual(bind.Nil)
    expect(result('')).toEqual(bind.Nil)
  })

  it('safely chains function', () => {
    const fns = [
      x => null,
      x => x.toString(),
    ]

    const result = initial =>
      bind.domonad(bind.NilMonad, fns, initial)

    expect(result(0)).toEqual(bind.Nil)
    expect(result(bind.Nil)).toEqual(bind.Nil)
  })
})
