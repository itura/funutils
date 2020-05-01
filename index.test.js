/* eslint-env jest */

const funutils = require('./')

describe('funutils', () => {
  test('common', () => {
    expect(
      funutils.chain(
        [1, 2, 3],
        funutils.map(x => x + 1),
        funutils.filter(x => x % 2 === 1),
        funutils.map(x => [x, null]),
        funutils.flatten(),
        funutils.compact(),
        funutils.reduce(
          (acc, x) => acc + (x === null ? 2 : x),
          0
        )
      )
    ).toEqual(3)
  })

  test('types', () => {
    const { Maybe } = funutils.types
    expect(Maybe.Maybe('hi')).toEqual(Maybe.Just('hi'))
    expect(Maybe.Maybe(null)).toEqual(Maybe.Nothing)
    expect(
      Maybe.Just('hi').map(funutils.id)
    ).toEqual(Maybe.Just('hi'))
    expect(
      Maybe.Nothing.map(funutils.id)
    ).toEqual(Maybe.Nothing)
  })

  test('LazySeq', () => {
    const data = () => [1, 2, null, 3].values()
    const seq = funutils.LazySeq(data)
      .compact()
      .map(x => x + 1)
      .filter(x => x % 2 === 1)

    expect(seq.take(3)).toEqual([3])
  })

  test('LazySeqM', () => {
    const data = () => [1, 2, 3].values()
    const seq = funutils.LazySeqM(data, funutils.monads.Maybe)
      .map(x => x + 1)
      .map(x => x % 2 === 1 ? x : null)
      .map(x => x.toString())

    expect(seq.take(3)).toEqual(['3'])
  })

  test('monads', () => {
    const { monads, id } = funutils

    expect(
      monads.applyM(monads.Id)(id)(1)
    ).toEqual(1)

    expect(
      monads.applyM(monads.Maybe)(id)(1)
    ).toEqual(1)

    expect(
      monads.applyM(monads.Sequence())(id)(1)
    ).toEqual(1)

    expect(
      monads.applyM(monads.FlatSequence)(id)(1)
    ).toEqual(1)

    expect(
      monads.applyM(monads.Something)(id)(1)
    ).toEqual(1)

    expect(
      monads.chainM(monads.Something)([id])(1)
    ).toEqual(1)

    const m = monads.composeM(monads.FlatSequence)(monads.Maybe)
    expect(
      monads.chainM(m)([id])([[1], null, 2])
    ).toEqual([1, funutils.types.Maybe.Nothing, 2])
  })
})
