/* eslint-env jest */

const monads = require('./')
const { Nothing } = require('../types/maybe')
const { id, compose } = require('../')

describe('MaybeMonad', () => {
  it('passes most truthy values, and returns Nothing for most falsey values', () => {
    const fns = [
      x => x
    ]

    const result = initial => monads.chainM(monads.MaybeMonad, fns, initial)

    expect(result(0)).toEqual(0)
    expect(result([])).toEqual([])

    expect(result(Nothing)).toEqual(Nothing)
    expect(result(null)).toEqual(Nothing)
    expect(result(undefined)).toEqual(Nothing)
    expect(result('')).toEqual(Nothing)
  })

  it('safely chains functions', () => {
    const fns = [
      x => x,
      x => x.toString()
    ]

    const result = initial => monads.chainM(monads.MaybeMonad, fns, initial)

    expect(result(0)).toEqual('0')
    expect(result([])).toEqual('')

    expect(result(Nothing)).toEqual(Nothing)
    expect(result(null)).toEqual(Nothing)
    expect(result(undefined)).toEqual(Nothing)
    expect(result('')).toEqual(Nothing)
  })

  it('monad law 1: map id = id', () => {
    const result = monads.MaybeMonad.map(id)

    expect(result(1)).toEqual(id(1))
    expect(result([])).toEqual(id([]))
    expect(result(Nothing)).toEqual(id(Nothing))
    expect(result(null)).toEqual(id(Nothing))
  })

  it('monad law 2: map f . map g = map(f . g)', () => {
    const map = monads.MaybeMonad.map
    const f = x => x + 2
    const g = x => x * 3
    const lhs = compose(map(f), map(g))
    const rhs = map(compose(f, g))

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs([])).toEqual(rhs([]))
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
    expect(lhs(null)).toEqual(rhs(null))
  })

  it('monad law 3: unit . f = map f . unit', () => {
    const map = monads.MaybeMonad.map
    const unit = monads.MaybeMonad.unit
    const f = id
    const lhs = compose(unit, f)
    const rhs = compose(map(f), unit)

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs(0)).toEqual(rhs(0))
    expect(lhs(null)).toEqual(rhs(null))
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
    expect(lhs([])).toEqual(rhs([]))
  })

  xit('monad law 4: join . map(map f) = map f . join', () => {
    const map = monads.MaybeMonad.map
    const join = monads.MaybeMonad.join
    const f = id
    const lhs = compose(join, map(map(f)))
    const rhs = map(compose(f, join))

    expect(lhs(1)).toEqual(rhs(1))
  })

  xit('monad law 5: join . unit = id', () => {
    const unit = monads.MaybeMonad.unit
    const join = monads.MaybeMonad.join
    const lhs = compose(join, unit)
    const rhs = id

    expect(lhs(1)).toEqual(rhs(1))
  })
})

describe('FlatSequenceMonad', () => {
  it('applies identity', () => {
    const fns = [
      x => x
    ]

    const result = initial =>
      monads.chainM(monads.FlatSequenceMonad, fns, initial)

    expect(result(1)).toEqual(1)
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(null)
    expect(result([null])).toEqual([null])
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

  it('monad law 1: map id = id', () => {
    const lhs = monads.FlatSequenceMonad.map(id)
    const rhs = id

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs([])).toEqual(rhs([]))
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
    expect(lhs(null)).toEqual(rhs(null))
  })

  it('monad law 2: map f . map g = map(f . g)', () => {
    const map = monads.FlatSequenceMonad.map
    const f = x => x + 2
    const g = x => x * 3
    const lhs = compose(map(f), map(g))
    const rhs = map(compose(f, g))

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs([])).toEqual(rhs([]))
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
    expect(lhs(null)).toEqual(rhs(null))
  })

  it('monad law 3: unit . f = map f . unit', () => {
    const map = monads.FlatSequenceMonad.map
    const unit = monads.FlatSequenceMonad.unit
    const f = id
    const lhs = compose(unit, f)
    const rhs = compose(map(f), unit)

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs(0)).toEqual(rhs(0))
    expect(lhs(null)).toEqual(rhs(null))
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
    expect(lhs([])).toEqual(rhs([]))
  })
})

describe('FlatSequenceMonad . MaybeMonad', () => {
  const monad = monads.composeM(monads.FlatSequenceMonad, monads.MaybeMonad)

  it('always return an array', () => {
    const fn = x => x

    const result = initial => monads.chainM(monad, [fn], initial)

    expect(result(1)).toEqual(1)
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(Nothing)
    expect(result([undefined])).toEqual([Nothing])
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
      Nothing,
      'a - 4',
      'b - 4',
      'c - 4',
      Nothing
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

    expect(result(1)).toEqual(1)
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(Nothing)
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
