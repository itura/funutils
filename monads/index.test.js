/* eslint-env jest */

const monads = require('./')

describe('MaybeMonad', () => {
  it('passes most truthy values, and returns Nil for most falsey values', () => {
    const fns = [
      x => x
    ]

    const result = initial => monads.chainM(monads.MaybeMonad, fns, initial)

    expect(result(0)).toEqual(0)
    expect(result([])).toEqual([])

    expect(result(monads.Nil)).toEqual(monads.Nil)
    expect(result(null)).toEqual(monads.Nil)
    expect(result(undefined)).toEqual(monads.Nil)
    expect(result('')).toEqual(monads.Nil)
  })

  it('safely chains functions', () => {
    const fns = [
      x => x.toString(),
      x => null
    ]

    const result = initial => monads.chainM(monads.MaybeMonad, fns, initial)

    expect(result(0)).toEqual(monads.Nil)
    expect(result(null)).toEqual(monads.Nil)
    expect(result(monads.Nil)).toEqual(monads.Nil)
  })
})

describe('FlatSequenceMonad', () => {
  it('always returns an array', () => {
    const fns = [
      x => x
    ]

    const result = initial =>
      monads.chainM(monads.FlatSequenceMonad, fns, initial)

    expect(result(1)).toEqual([1])
    expect(result([])).toEqual([])
    expect(result(null)).toEqual([null])
  })

  it('flattens return values that are arrays', () => {
    const fns = [
      x => [x + 1, x + 2],
      x => `${x}!`
    ]

    const result = initial =>
      monads.chainM(monads.FlatSequenceMonad, fns, initial)

    expect(result(1)).toEqual(['2!', '3!'])
  })
})

describe('FlatSequenceMonad . MaybeMonad', () => {
  const monad = monads.composeM(monads.FlatSequenceMonad, monads.MaybeMonad)

  it('always return an array', () => {
    const fn = x => x

    const result = initial => monads.chainM(monad, [fn], initial)

    expect(result(1)).toEqual([1])
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
    expect(result([])).toEqual([])
    expect(result(null)).toEqual([monads.Nil])
    expect(result([undefined])).toEqual([monads.Nil])
  })

  it('processes each item', () => {
    const fns = [
      x => [x + 1, x + 2],
      x => `${x}`,
      x => [`a - ${x}`, `b - ${x}`, `c - ${x}`]
    ]

    const result = initial => monads.chainM(monad, fns, initial)

    expect(result(1)).toEqual([
      'a - 2',
      'b - 2',
      'c - 2',
      'a - 3',
      'b - 3',
      'c - 3'
    ])
  })

  it('processes each item with nil safety', () => {
    const fns = [
      x => [x + 1, x + 2, x + 3, x + 4],
      x => x % 2 === 0 ? `${x}` : undefined,
      x => [`a - ${x.toString()}`, `b - ${x}`, `c - ${x}`]
    ]

    const result = initial => monads.chainM(monad, fns, initial)

    expect(result(1)).toEqual([
      'a - 2',
      'b - 2',
      'c - 2',
      monads.Nil,
      'a - 4',
      'b - 4',
      'c - 4',
      monads.Nil
    ])
  })
})

// not intended to be used this way, but informative to see
// does this indicate the monads are not quite monads / not fully defined enough to be generally composable?
describe('MaybeMonad . FlatSequenceMonad', () => {
  it('always return a Maybe', () => {
    const fns = [
      x => x
    ]
    const monad = monads.composeM(monads.MaybeMonad, monads.FlatSequenceMonad)

    const result = initial =>
      monads.chainM(monad, fns, initial)

    expect(result(1)).toEqual([1])
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(monads.Nil)
    expect(result([undefined])).toEqual([undefined]) // not great
  })

  it('flattens return values that are arrays', () => {
    const fns = [
      x => [x + 1, x + 2],
      x => `${x}!`
    ]
    const monad = monads.composeM(monads.MaybeMonad, monads.FlatSequenceMonad)

    const result = initial =>
      monads.chainM(monad, fns, initial)

    expect(result(1)).toEqual(['2!', '3!'])
    expect(result([1])).toEqual(['2!', '3!'])
    expect(result([1, 3])).toEqual(['2!', '3!', '4!', '5!'])
  })

  it('leaves intermediate nils', () => {
    const fns = [
      x => [x + 1, x + 2],
      x => `${x}!`,
      x => undefined
    ]
    const monad = monads.composeM(monads.MaybeMonad, monads.FlatSequenceMonad)

    const result = initial =>
      monads.chainM(monad, fns, initial)

    expect(result(1)).toEqual([undefined, undefined]) // not great
  })
})
