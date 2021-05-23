/* eslint-env jest */

const { id, chain } = require('./common')
const maybe = require('./maybe')
const result = require('./result')

describe('result', () => {
  it('do', () => {
    expect(result.Success('yay').map(id)).toStrictEqual(new result.Success('yay'))
    expect(result.Failure('boo').map(id)).toStrictEqual(new result.Failure('boo'))
    expect(result.Pending().map(id)).toStrictEqual(new result.Pending())

    const transform = chain(
      result.map(x => x + 1),
      result.map(x => x % 2 === 0 ? result.Success(x) : result.Failure('boo')),
      result.unwrap({
        success: id,
        pending: () => '?',
        failure: e => e + '!'
      })
    )

    expect(transform(result.Success(1))).toEqual(2)
    expect(transform(result.Success(2))).toEqual('boo!')
    expect(transform(result.Failure(1))).toEqual('1!')
    expect(transform(result.Pending())).toEqual('?')

    const transform1 = chain(
      result.map(x => x + 1),
      result.map(x => x % 2 === 0 ? result.Success(x) : result.Failure('boo')),
      result.unwrapOr(e => e + '!')
    )

    expect(transform1(result.Success(1))).toEqual(2)
    expect(transform1(result.Success(2))).toEqual('boo!')
    expect(transform1(result.Failure(1))).toEqual('1!')
    expect(transform1(result.Pending())).toEqual('undefined!')
  })

  it('is a maybe, but not the other way around', () => {
    expect(maybe.isMaybe(result.Success(1))).toEqual(true)
    expect(result.Success(1) instanceof maybe.Just).toEqual(true)
    expect(maybe.isMaybe(result.Failure(1))).toEqual(true)
    expect(result.Failure(1) instanceof maybe.Nothing).toEqual(true)

    const transform = chain(
      result.map(x => x + 1),
      maybe.map(x => x % 2 === 0 ? result.Success(x) : result.Failure('boo')),
      maybe.unwrapOr(e => `${e}`)
    )

    expect(transform(result.Success(1))).toEqual(2)
    expect(transform(result.Success(2))).toEqual('undefined')
    expect(transform(result.Failure(1))).toEqual('undefined')
    expect(transform(result.Pending())).toEqual('undefined')
    expect(() => transform(maybe.Just(1))).toThrow('funutils.result: not a Result: \'maybe.Just 1\'')

    const transform2 = chain(
      maybe.dig('key'),
      maybe.map(x => x + '!'),
      maybe.map(x => x.length),
      maybe.unwrapOr(() => -1)
    )

    expect(transform2(result.Success({ key: 'hi' }))).toEqual(3)
    expect(transform2(result.Success({ woops: 'hi' }))).toEqual(-1)
    expect(transform2(result.Failure({ key: 'hi' }))).toEqual(-1)
    expect(transform2(result.Pending())).toEqual(-1)
  })

  describe('given', () => {
    const r1 = result.Success({ name: 'hi' })
    const r2 = result.Success({ blah: 'there' })
    const r3 = result.Pending()
    const r4 = result.Failure('oops')

    it('applies the function when all Results are Successes', () => {
      expect(
        result.given((v1, v2) => `${v1.name} ${v2.blah}`)(r1, r2)
      ).toEqual(
        result.Success('hi there')
      )

      expect(
        result.given((v1, v2) => null)(r1, r2)
      ).toEqual(
        result.Failure('funutils.result: Received null')
      )
    })

    it('returns Pending with any Result is Pending', () => {
      expect(
        result.given((v1, v2) => `${v1.name} ${v2.blah}`)(r1, r3)
      ).toEqual(
        result.Pending()
      )
    })

    it('returns Failure with any Result is Failure', () => {
      expect(
        result.given((v1, v2) => `${v1.name} ${v2.blah}`)(r1, r4)
      ).toEqual(
        result.Failure('oops')
      )
    })

    it('returns the first non-Success state', () => {
      expect(
        result.given((v1, v2) => `${v1.name} ${v2.blah}`)(r3, r4, r1)
      ).toEqual(
        result.Pending()
      )

      expect(
        result.given((v1, v2) => `${v1.name} ${v2.blah}`)(r4, r3, r1)
      ).toEqual(
        result.Failure('oops')
      )
    })
  })
})
