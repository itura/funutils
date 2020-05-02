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

    return funutils.chainP(
      Promise.resolve(1),
      x => Promise.resolve(x + 2),
      r => expect(r).toEqual(3)
    )
  })

  test('Maybe', () => {
    const { Maybe, Just, Nothing } = funutils.Maybe
    expect(Maybe('hi')).toEqual(Just('hi'))
    expect(Maybe(null)).toEqual(Nothing)
    expect(
      Just('hi').map(funutils.id)
    ).toEqual(Just('hi'))
    expect(
      Nothing.map(funutils.id)
    ).toEqual(Nothing)
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
    const { Nothing } = require('./maybe')
    const data = () => [1, 2, 3].values()
    const seq = funutils.LazySeqM(funutils.monads.Maybe, data)
      .map(x => x + 1)
      .map(x => x % 2 === 1 ? x : null)
      .map(x => x.toString())

    expect(seq.take(3)).toEqual([Nothing, '3', Nothing])
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
      monads.chainM(m)([id])([[1, 2], null, [4], 5])
    ).toEqual([1, 2, funutils.Maybe.Nothing, 4, 5])
  })
})
