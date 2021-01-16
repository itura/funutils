/* eslint-env jest */

const monads = require('./monads')
const { applyM, chainM, composeM } = require('./common')
const { Maybe, Just, Nothing } = require('./maybe')
const { compose, id } = require('./common')
const result = require('./result')

describe('Maybe', () => {
  it('applies identity', () => {
    const result = applyM(monads.Maybe)(id)

    expect(result(0)).toEqual(0)
    expect(result([])).toEqual([])
    expect(result('')).toEqual('')

    expect(result(Nothing())).toEqual(Nothing())
    expect(result(null)).toEqual(Nothing())
    expect(result(undefined)).toEqual(Nothing())
  })

  it('safely chains functions', () => {
    const result = chainM(monads.Maybe)(
      x => x,
      x => x.toString()
    )

    expect(result(0)).toEqual('0')
    expect(result([])).toEqual('')
    expect(result('')).toEqual('')

    expect(result(Nothing())).toEqual(Nothing())
    expect(result(null)).toEqual(Nothing())
    expect(result(undefined)).toEqual(Nothing())
  })

  it('monad law 1', () => {
    const unit = monads.Maybe.unit
    const bind = monads.Maybe.bind
    const f = id
    const lhs = compose(bind(f))(unit)
    const rhs = f

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs(null)).toEqual(rhs(Nothing())) // ?
    expect(lhs(Nothing())).toEqual(rhs(Nothing()))
  })

  it('monad law 2', () => {
    const unit = monads.Maybe.unit
    const bind = monads.Maybe.bind
    const lhs = bind(unit)
    const rhs = Maybe

    expect(lhs(Maybe(1))).toEqual(rhs(Just(1)))
    expect(lhs(Nothing())).toEqual(rhs(Nothing()))
  })

  it('monad law 3', () => {
    const bind = monads.Maybe.bind
    const f = x => Just(x + 1)
    const g = x => Just(x + 2)
    const lhs = compose(bind(g))(bind(f))
    const rhs = bind(compose(bind(g))(f))

    expect(lhs(Maybe(1))).toEqual(rhs(Just(1)))
    expect(lhs(Nothing())).toEqual(rhs(Nothing()))
  })
})

describe('Result', () => {
  it('monad law 1', () => {
    const { unit, bind } = monads.Result
    const f = result.Result
    const lhs = compose(bind(f))(unit)
    const rhs = f

    expect(lhs(1)).toStrictEqual(rhs(1))
    expect(lhs(null)).toStrictEqual(rhs(null))

    const leftSuccess = lhs(result.Success('hi'))
    const rightSuccess = rhs(result.Success('hi'))
    expect(leftSuccess).toEqual(rightSuccess)
    expect(leftSuccess).toBeInstanceOf(result.Success)
    expect(rightSuccess).toBeInstanceOf(result.Success)

    const leftFailure = lhs(result.Failure('hi'))
    const rightFailure = rhs(result.Failure('hi'))
    expect(leftFailure).toStrictEqual(rightFailure)
    expect(leftFailure).toBeInstanceOf(result.Failure)
    expect(rightFailure).toBeInstanceOf(result.Failure)
  })

  it('monad law 2', () => {
    const { unit, bind } = monads.Result
    const lhs = bind(unit)
    const rhs = id

    const leftSuccess = lhs(result.Success('hi'))
    const rightSuccess = rhs(result.Success('hi'))
    expect(leftSuccess).toEqual(rightSuccess)
    expect(leftSuccess).toBeInstanceOf(result.Success)
    expect(rightSuccess).toBeInstanceOf(result.Success)

    const leftFailure = lhs(result.Failure('hi'))
    const rightFailure = rhs(result.Failure('hi'))
    expect(leftFailure).toStrictEqual(rightFailure)
    expect(leftFailure).toBeInstanceOf(result.Failure)
    expect(rightFailure).toBeInstanceOf(result.Failure)
  })

  it('monad law 3', () => {
    const { bind } = monads.Result
    const f = x => result.Success(x + '!')
    const g = x => result.Success(x + '@')
    const lhs = compose(bind(g))(bind(f))
    const rhs = bind(compose(bind(g))(f))

    expect(lhs(result.Success(1))).toEqual(result.Success('1!@'))
    expect(rhs(result.Success(1))).toEqual(result.Success('1!@'))
    expect(lhs(result.Success(1))).toEqual(rhs(result.Success(1)))
    expect(lhs(result.Failure(1))).toEqual(rhs(result.Failure(1)))
  })
})

describe('FlatSequence', () => {
  const chainFlat = chainM(monads.FlatSequence)

  it('applies identity', () => {
    const result = applyM(monads.FlatSequence)(id)

    expect(result(1)).toEqual(1)
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(null)
    expect(result([null])).toEqual([null])
    expect(result(Nothing())).toEqual(Nothing())
    expect(result([Nothing()])).toEqual([Nothing()])
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
    expect(result([[1, 2], 3])).toEqual([1, 2, 3])
    expect(result([[1, null], 3])).toEqual([1, null, 3])
  })

  it('applies functions to a single element', () => {
    const result = chainFlat(
      x => x + 1,
      x => `${x}!`
    )

    expect(result(1)).toEqual('2!')
  })

  it('applies functions to each element of an input sequence', () => {
    const result = chainFlat(
      x => x + 1,
      x => `${x}!`
    )

    expect(result([])).toEqual([])
    expect(result([1])).toEqual(['2!'])
    expect(result([1, 2])).toEqual(['2!', '3!'])
  })

  it('applies functions to each element of a sequence returned by a previous function', () => {
    const result = chainFlat(
      x => [x, [x, x]],
      x => `${x}!`
    )

    expect(result(1)).toEqual(['1!', '1,1!'])
    expect(result([])).toEqual([])
    expect(result([1])).toEqual(['1!', '1,1!'])
    expect(result([1, 2])).toEqual(['1!', '1,1!', '2!', '2,2!'])
  })

  it('does nothing to return values from the last function', () => {
    const result = chainFlat(
      () => [1, [2, 3]]
    )

    expect(result()).toEqual([1, [2, 3]])
  })

  it('monad law 1', () => {
    const unit = monads.FlatSequence.unit
    const bind = monads.FlatSequence.bind
    const f = id
    const lhs = compose(bind(f))(unit)
    const rhs = f

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs([1])).toEqual(rhs([1]))
    expect(lhs([1, 2])).toEqual(rhs([1, 2]))
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
    const lhs = compose(bind(g))(bind(f))
    const rhs = bind(compose(bind(g))(f))

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1])).toEqual(rhs([1]))
  })
})

describe('SomethingMonad', () => {
  const chainFlat = chainM(monads.Something)

  it('applies identity', () => {
    const result = applyM(monads.Something)(id)

    expect(result(1)).toEqual(1)
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(Nothing())
    expect(result([null])).toEqual([])
    expect(result(Nothing())).toEqual(Nothing())
    expect(result([Nothing()])).toEqual([])
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('applies functions to a single element', () => {
    const result = chainFlat(
      x => x + 1,
      x => `${x}!`
    )

    expect(result(1)).toEqual('2!')
  })

  it('returns Nothing instead of applying functions to Nothings from the input', () => {
    const result = chainFlat(
      x => x.toString()
    )

    expect(result(null)).toEqual(Nothing())
  })

  it('returns Nothing instead of applying functions to Nothings from previous functions', () => {
    const result = chainFlat(
      x => null,
      x => x.toString()
    )

    expect(result(1)).toEqual(Nothing())
  })

  it('applies functions to each element of an input sequence', () => {
    const result = chainFlat(
      x => x + 1,
      x => `${x}!`
    )

    expect(result([])).toEqual([])
    expect(result([1])).toEqual(['2!'])
    expect(result([1, 2])).toEqual(['2!', '3!'])
  })

  it('applies functions to each element of a sequence returned by a previous function', () => {
    const result = chainFlat(
      x => [x, [x, x]],
      x => `${x}!`
    )

    expect(result(1)).toEqual(['1!', '1,1!'])
    expect(result([])).toEqual([])
    expect(result([1])).toEqual(['1!', '1,1!'])
    expect(result([1, 2])).toEqual(['1!', '1,1!', '2!', '2,2!'])
  })

  it('filters nested Nothings from the results of previous functions', () => {
    const result = chainFlat(
      x => [null, 1, Nothing()],
      x => x.toString()
    )

    expect(result(1)).toEqual(['1'])
  })

  it('does nothing to return values from the last function', () => {
    const result = chainFlat(
      x => [x, [x, x], null]
    )

    expect(result(1)).toEqual([1, [1, 1], null])
  })

  it('monad law 1', () => {
    const unit = monads.Something.unit
    const bind = monads.Something.bind
    const f = id
    const lhs = compose(bind(f))(unit)
    const rhs = f

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs([1])).toEqual(rhs([1]))
    expect(lhs([])).toEqual(rhs([]))
  })

  it('monad law 2', () => {
    const unit = monads.Something.unit
    const bind = monads.Something.bind
    const lhs = bind(unit)
    const rhs = id

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1])).toEqual(rhs([1]))

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1, 2])).toEqual(rhs([1, 2]))
    expect(lhs([[1], 2])).toEqual(rhs([[1], 2]))
  })

  it('monad law 3', () => {
    const bind = monads.Something.bind
    const f = x => [x + 1, x + 2]
    const g = x => [x + 3]
    const lhs = compose(bind(g))(bind(f))
    const rhs = bind(compose(bind(g))(f))

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1])).toEqual(rhs([1]))
  })
})

describe('FlatSequence . Maybe', () => {
  const monad = composeM(monads.FlatSequence)(monads.Maybe)
  const chainFlat = chainM(monad)

  it('applies identity', () => {
    const result = applyM(monad)(id)

    expect(result(1)).toEqual(1)
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(Nothing())
    expect(result([null])).toEqual([Nothing()])
    expect(result(Nothing())).toEqual(Nothing())
    expect(result([Nothing()])).toEqual([Nothing()])
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('applies functions to a single element', () => {
    const result = chainFlat(
      x => x + 1,
      x => `${x}!`
    )

    expect(result(1)).toEqual('2!')
  })

  it('returns Nothing instead of applying functions to Nothings from the input', () => {
    const result = chainFlat(
      x => x.toString()
    )

    expect(result(null)).toEqual(Nothing())
  })

  it('returns Nothing instead of applying functions to Nothings from previous functions', () => {
    const result = chainFlat(
      x => null,
      x => x.toString()
    )

    expect(result(1)).toEqual(Nothing())
  })

  it('applies functions to each element of an input sequence', () => {
    const result = chainFlat(
      x => x + 1,
      x => `${x}!`
    )

    expect(result([])).toEqual([])
    expect(result([1])).toEqual(['2!'])
    expect(result([1, 2])).toEqual(['2!', '3!'])
  })

  it('applies functions to each element of a sequence returned by a previous function', () => {
    const result = chainFlat(
      x => [x, [x, x]],
      x => `${x}!`
    )

    expect(result(1)).toEqual(['1!', '1,1!'])
    expect(result([])).toEqual([])
    expect(result([1])).toEqual(['1!', '1,1!'])
    expect(result([1, 2])).toEqual(['1!', '1,1!', '2!', '2,2!'])
  })

  it('returns Nothing instead of applying functions to nested Nothings from previous functions', () => {
    const result = chainFlat(
      x => [null, 1, Nothing()],
      x => x.toString()
    )

    expect(result(1)).toEqual([Nothing(), '1', Nothing()])
  })

  it('does nothing to return values from the last function', () => {
    const result = chainFlat(
      x => [x, [x, x], null]
    )

    expect(result(1)).toEqual([1, [1, 1], null])
  })

  it('monad law 1', () => {
    const unit = monad.unit
    const bind = monad.bind
    const f = id
    const lhs = compose(bind(f))(unit)
    const rhs = f

    expect(lhs(1)).toEqual(rhs(1))
    expect(lhs([1])).toEqual(rhs([1]))
    expect(lhs([])).toEqual(rhs([]))
  })

  it('monad law 2', () => {
    const unit = monad.unit
    const bind = monad.bind
    const lhs = bind(unit)
    const rhs = id

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1])).toEqual(rhs([1]))

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1, 2])).toEqual(rhs([1, 2]))
    expect(lhs([[1], 2])).toEqual(rhs([[1], 2]))
  })

  it('monad law 3', () => {
    const bind = monad.bind
    const f = x => [x + 1, x + 2]
    const g = x => [x + 3]
    const lhs = compose(bind(g))(bind(f))
    const rhs = bind(compose(bind(g))(f))

    expect(lhs([])).toEqual(rhs([]))
    expect(lhs([1])).toEqual(rhs([1]))
  })

  // original tests
  it('flattens results, applying following transforms to each', () => {
    const fs = [
      x => [x + 1, x + 2],
      x => `${x}`,
      x => [`a - ${x}`, `b - ${x}`, `c - ${x}`]
    ]

    const result = chainM(monad)(...fs)

    expect(result(1)).toEqual([
      'a - 2',
      'b - 2',
      'c - 2',
      'a - 3',
      'b - 3',
      'c - 3'
    ])
  })

  it('returns Nothing instead of applying a Nothing', () => {
    const fs = [
      x => [x + 1, x + 2, x + 3, x + 4],
      x => x % 2 === 0 ? `${x}` : undefined,
      x => [`a - ${x.toString()}`, `b - ${x}`, `c - ${x}`]
    ]

    const result = chainM(monad)(...fs)

    expect(result(1)).toEqual([
      'a - 2',
      'b - 2',
      'c - 2',
      Nothing(),
      'a - 4',
      'b - 4',
      'c - 4',
      Nothing()
    ])
  })
})

// not intended to be used this way, but informative to see
describe('Maybe . FlatSequence', () => {
  const monad = composeM(monads.Maybe)(monads.FlatSequence)
  it('always return a Maybe', () => {
    const result = chainM(monad)(id)

    expect(result(1)).toEqual(1)
    expect(result([1, 2, 3])).toEqual([1, 2, 3])
    expect(result([])).toEqual([])
    expect(result(null)).toEqual(Nothing())
    expect(result([undefined])).toEqual([undefined]) // not great
  })

  it('flattens return values that are arrays', () => {
    const fs = [
      x => [x + 1, x + 2],
      x => `${x}!`
    ]

    const result = chainM(monad)(...fs)

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

    const result = chainM(monad)(...fs)

    expect(result(1)).toEqual([undefined, undefined]) // not great
  })
})
