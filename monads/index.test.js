/* eslint-env jest */

const monads = require('./')
const { Maybe, Just, Nothing } = require('../types/maybe')
const { compose, id } = require('../common')

describe('Maybe', () => {
  it('applies identity', () => {
    const fs = [
      x => x
    ]

    const result = monads.chainM(monads.Maybe)(fs)

    expect(result(0)).toEqual(0)
    expect(result([])).toEqual([])

    expect(result(Nothing)).toEqual(Nothing)
    expect(result(null)).toEqual(Nothing)
    expect(result(undefined)).toEqual(Nothing)
    expect(result('')).toEqual(Nothing)
  })

  it('safely chains functions', () => {
    const fs = [
      x => x,
      x => x.toString()
    ]

    const result = monads.chainM(monads.Maybe)(fs)

    expect(result(0)).toEqual('0')
    expect(result([])).toEqual('')

    expect(result(Nothing)).toEqual(Nothing)
    expect(result(null)).toEqual(Nothing)
    expect(result(undefined)).toEqual(Nothing)
    expect(result('')).toEqual(Nothing)
  })

  it('monad law 1', () => {
    const unit = monads.Maybe.unit
    const bind = monads.Maybe.bind
    const f = id
    const lhs = compose(bind(f), unit)
    const rhs = f

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs(null)).toEqual(rhs(Nothing)) // ?
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
  })

  it('monad law 2', () => {
    const unit = monads.Maybe.unit
    const bind = monads.Maybe.bind
    const lhs = bind(unit)
    const rhs = id

    expect(lhs(Maybe(1))).toEqual(rhs(Just(1)))
    expect(lhs(Maybe(null))).toEqual(rhs(Nothing)) // ?
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
  })

  it('monad law 3', () => {
    const bind = monads.Maybe.bind
    const f = x => Just(x + 1)
    const g = x => Just(x + 2)
    const lhs = compose(bind(g), bind(f))
    const rhs = bind(compose(bind(g), f))

    expect(lhs(Maybe(1))).toEqual(rhs(Just(1)))
    expect(lhs(Maybe(null))).toEqual(rhs(Nothing)) // ?
    expect(lhs(Nothing)).toEqual(rhs(Nothing))
  })
})

describe('FlatSequence', () => {
  it('applies identity', () => {
    const fs = [
      x => x
    ]

    const result = monads.chainM(monads.FlatSequence)(fs)

    expect(result(1)).toEqual(1)
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(null)
    expect(result([null])).toEqual([null])
    expect(result(Nothing)).toEqual(Nothing)
    expect(result([Nothing])).toEqual([Nothing])
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('flattens return values that are arrays', () => {
    const fs = [
      x => [[x + 1], x + 2],
      x => `${x}!`
    ]

    const result = monads.chainM(monads.FlatSequence)(fs)

    expect(result(1)).toEqual(['2!', '3!'])
    expect(result([1, 3])).toEqual(['2!', '3!', '4!', '5!'])
  })

  it('monad law 1', () => {
    const unit = monads.FlatSequence.unit
    const bind = monads.FlatSequence.bind
    const f = id
    const lhs = compose(bind(f), unit)
    const rhs = f

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs([1])).toEqual(rhs([1]))
    expect(lhs([])).toEqual(rhs([]))
  })

  it('monad law 2', () => {
    const unit = monads.FlatSequence.unit
    const bind = monads.FlatSequence.bind
    const lhs = bind(unit)
    const rhs = id

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1])).toEqual(rhs([1]))

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1, 2])).toEqual(rhs([1, 2]))
    expect(lhs([[1], 2])).toEqual(rhs([[1], 2]))
  })

  it('monad law 3', () => {
    const bind = monads.FlatSequence.bind
    const f = x => [x + 1, x + 2]
    const g = x => [x + 3]
    const lhs = compose(bind(g), bind(f))
    const rhs = bind(compose(bind(g), f))

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1])).toEqual(rhs([1]))
  })
})

describe('FlatSequence . Maybe', () => {
  const monad = monads.composeM(monads.FlatSequence)(monads.Maybe)

  it('applies identity', () => {
    const fs = [x => x]

    const result = monads.chainM(monad)(fs)

    expect(result(1)).toEqual(1)
    expect(result([])).toEqual([])
    expect(result([1])).toEqual([1])
    expect(result([1, 2])).toEqual([1, 2])
    expect(result(null)).toEqual(Nothing)
    expect(result([undefined])).toEqual([Nothing])
  })

  it('processes each item', () => {
    const fs = [
      x => [x + 1, x + 2],
      x => `${x}`,
      x => [`a - ${x}`, `b - ${x}`, `c - ${x}`]
    ]

    const result = monads.chainM(monad)(fs)

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
    const fs = [
      x => [x + 1, x + 2, x + 3, x + 4],
      x => x % 2 === 0 ? `${x}` : undefined,
      x => [`a - ${x.toString()}`, `b - ${x}`, `c - ${x}`]
    ]

    const result = monads.chainM(monad)(fs)

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
describe('Maybe . FlatSequence', () => {
  const monad = monads.composeM(monads.Maybe)(monads.FlatSequence)
  it('always return a Maybe', () => {
    const fs = [
      x => x
    ]

    const result = monads.chainM(monad)(fs)

    expect(result(1)).toEqual(1)
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(Nothing)
    expect(result([undefined])).toEqual([undefined]) // not great
  })

  it('flattens return values that are arrays', () => {
    const fs = [
      x => [x + 1, x + 2],
      x => `${x}!`
    ]

    const result = monads.chainM(monad)(fs)

    expect(result(1)).toEqual(['2!', '3!'])
    expect(result([1])).toEqual(['2!', '3!'])
    expect(result([1, 3])).toEqual(['2!', '3!', '4!', '5!'])
  })

  it('leaves intermediate nils', () => {
    const fs = [
      x => [x + 1, x + 2],
      x => `${x}!`,
      x => undefined
    ]

    const result = monads.chainM(monad)(fs)

    expect(result(1)).toEqual([undefined, undefined]) // not great
  })
})
