/* eslint-env jest */

const funutils = require('./')

describe('funutils', () => {
  describe('common', () => {
    test('chain w/ Array', () => {
      const { map, filter, flat, compact, reduce } = funutils.array

      expect(
        funutils.chain(
          map(x => x + 1),
          filter(x => x % 2 === 1),
          map(x => [x, null]),
          flat(),
          compact(),
          reduce(
            (acc, x) => acc + (x === null ? 2 : x),
            0
          )
        )([1, 2, 3])
      ).toEqual(3)
    })

    test('functor utilities', () => {
      expect(
        funutils.applyF(['hi'])(
          x => `${x}!`
        )
      ).toEqual(['hi!'])

      expect(
        funutils.chainF(
          x => `${x}!`,
          x => `${x}${x}`
        )(['hi'])
      ).toEqual(['hi!hi!'])

      const { Maybe, Just, Nothing } = funutils.maybe
      const fun = x => `${x}!`
      expect(
        funutils.chainF(fun, fun)(Maybe(null))
      ).toStrictEqual(Nothing())

      expect(
        funutils.chainF(fun, fun)(Maybe('hi'))
      ).toStrictEqual(Just('hi!!'))
    })

    test('chainP', () => {
      const stripAnsi = require('strip-ansi')
      return funutils.chainP(
        x => Promise.resolve(x + 2),
        r => expect(r).toEqual(3),
        r => expect(r).toBeDefined()
      )(1)
        .catch(e => expect(stripAnsi(e.message)).toContain('Received: undefined'))
    })

    test('misc', () => {
      expect(funutils.zip([1, 2], ['a', 'b'])).toEqual(
        [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
      )

      expect(funutils.randomInt(5)).toBeLessThan(5)

      expect(funutils.repeat(3, i => `${i}!`)).toEqual(['0!', '1!', '2!'])

      const builder = funutils.Builder(config => value => [config, value])
      const built = builder(
        config => ({ beep: 'MEEP' }),
        config => ({ beep: config.beep + '!' }),
        config => ({ boop: 'BOOP' })
      )

      expect(
        built('hi')
      ).toEqual([
        {
          beep: 'MEEP!',
          boop: 'BOOP'
        },
        'hi'
      ])

      expect(
        built('bye')
      ).toEqual([
        {
          beep: 'MEEP!',
          boop: 'BOOP'
        },
        'bye'
      ])
    })
  })

  test('Maybe', () => {
    const { Maybe, Just, Nothing } = funutils.maybe
    expect(Maybe('hi')).toEqual(Just('hi'))
    expect(Maybe(null)).toEqual(Nothing())
    expect(
      Just('hi').map(funutils.id)
    ).toEqual(Just('hi'))
    expect(
      Nothing().map(funutils.id)
    ).toEqual(Nothing())
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
      funutils.applyM(monads.Id)(id)(1)
    ).toEqual(1)

    expect(
      funutils.applyM(monads.Maybe)(id)(1)
    ).toEqual(1)

    expect(
      funutils.applyM(monads.Sequence())(id)(1)
    ).toEqual(1)

    expect(
      funutils.applyM(monads.FlatSequence)(id)(1)
    ).toEqual(1)

    expect(
      funutils.applyM(monads.Something)(id)(1)
    ).toEqual(1)

    expect(
      funutils.chainM(monads.Something)(id, id)(1)
    ).toEqual(1)

    const m1 = funutils.composeM(monads.FlatSequence)(monads.Maybe)
    const m2 = monads.Something
    const data = [[1, 2], null, [4], 5]

    expect(
      funutils.chainM(m1)(id)(data)
    ).toEqual([1, 2, funutils.maybe.Nothing(), 4, 5])

    expect(
      funutils.chainM(m2)(id)(data)
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
      Colors(fg(Purple), someColorBg, underline)(' fun ') +
      custom(' utils ') +
      boldPurple(' sure is fun!')
    )
  })

  test('perf', async () => {
    const perf = funutils.perf(global.performance || require('perf_hooks').performance)
    const [durationMs, result] = await perf.time(async () => {
      await funutils.sleep(50)
      return 'wow so fast'
    })

    expect(durationMs).toBeGreaterThanOrEqual(50)
    expect(result).toEqual('wow so fast')
  })

  test('string', () => {
    const { array, string } = funutils

    expect(
      funutils.chain(
        string.repeat(4),
        string.split('!'),
        funutils.chain(
          array.filter(string.includes('hi')),
          array.filter(string.match(/hi/)),
          array.map(funutils.chain(
            string.toUpperCase(),
            string.padEnd(4)
          )),
          array.join('!')
        )
      )('hi!')
    ).toEqual(
      'HI  !HI  !HI  !HI  '
    )
  })

  test('number', () => {
    expect(
      funutils.number.toPrecision(3)(1.11111)
    ).toEqual(
      '1.11'
    )

    expect(
      funutils.number.toFixed(2)(1.11111)
    ).toEqual(
      '1.11'
    )

    expect(
      funutils.number.toLocaleString('de-DE')(123456.789)
    ).toEqual(
      '123.456,789'
    )
  })
})
