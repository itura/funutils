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

    expect(funutils.zip([1, 2], ['a', 'b'])).toEqual(
      [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
    )

    expect(funutils.randomInt(5)).toBeLessThan(5)

    expect(funutils.repeat(3, i => `${i}!`)).toEqual(['0!', '1!', '2!'])

    expect(
      funutils.applyF(['hi'])(
        x => `${x}!`
      )
    ).toEqual(['hi!'])

    expect(
      funutils.chainF(['hi'])(
        x => `${x}!`,
        x => `${x}${x}`
      )
    ).toEqual(['hi!hi!'])

    const [build] = funutils.Builder(config => value => [config, value])
    expect(
      build(
        () => ({ beep: 'MEEP' }),
        () => ({ beep: 'BEEP' }),
        () => ({ boop: 'BOOP' })
      )('hi')
    ).toEqual([
      {
        beep: 'BEEP',
        boop: 'BOOP'
      },
      'hi'
    ])

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

    const seq1 = seq
      .reduce((sum, x) => sum + x, 1)

    expect(seq1.take(3)).toEqual(4)
  })

  test('LazySeqM', () => {
    const data = () => [1, 2, 3].values()
    const seq = funutils.LazySeqM(funutils.monads.Maybe, data)
      .map(x => x + 1)
      .map(x => x % 2 === 1 ? x : null)
      .map(x => x.toString())

    expect(seq.take(3)).toEqual(['3'])

    const seq1 = seq
      .reduce((acc, x) => `${acc} ${x}`, 'hi')

    expect(seq1.take(3)).toEqual('hi 3')
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

    const m1 = monads.composeM(monads.FlatSequence)(monads.Maybe)
    const m2 = monads.Something
    const data = [[1, 2], null, [4], 5]

    expect(
      monads.applyM(m1)(id)(data)
    ).toEqual([1, 2, funutils.Maybe.Nothing, 4, 5])

    expect(
      monads.applyM(m2)(id)(data)
    ).toEqual([1, 2, 4, 5])
  })

  test('generators', () => {
    const i1 = funutils.generators.integers()
    expect(
      funutils.repeat(5, () => i1.next())
    ).toEqual([
      { value: 0, done: false },
      { value: 1, done: false },
      { value: 2, done: false },
      { value: 3, done: false },
      { value: 4, done: false }
    ])

    const i2 = funutils.generators.zip([1, 2], ['a', 'b'])
    expect(
      funutils.repeat(5, () => i2.next())
    ).toEqual([
      { value: [1, 'a'], done: false },
      { value: [1, 'b'], done: false },
      { value: [2, 'a'], done: false },
      { value: [2, 'b'], done: false },
      { value: undefined, done: true }
    ])
  })

  test('UserJourney', async done => {
    const page = {
      getElement: jest.fn().mockReturnValue(true)
    }

    await funutils.UserJourney(page, done.fail)
      .given('something works', async page => {
        expect(page.getElement('a')).toEqual(true)
      })
      .then('this other thing should too', async page => {
        expect(page.getElement('b')).toEqual(true)
      })
      .run()

    expect(page.getElement).toHaveBeenCalledTimes(2)
    expect(page.getElement).toHaveBeenNthCalledWith(1, 'a')
    expect(page.getElement).toHaveBeenNthCalledWith(2, 'b')
    done()
  })

  test('colors', () => {
    const { Colors, Purple, fg, bg, bold, underline } = funutils.colors
    const someColor = fg(248)
    const someColorBg = bg(248)
    const boldPurple = Colors(fg(Purple), bold)
    const custom = Colors(someColor, bold, bg(Purple))

    console.log(
      Colors(fg(Purple), someColorBg, underline)('fun ') +
      custom(' utils ') +
      boldPurple(' sure is fun!')
    )
  })
})
