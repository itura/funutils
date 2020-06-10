/* eslint-env jest */

const { chainP, chainWith, compose, id, zip, randomInt, repeat } = require('./common')

test('common', () => {
  const one = [1, 2]
  const two = ['a', 'b']
  const three = [3, 4]

  expect(zip(one)).toEqual([
    [1, 2]
  ])

  expect(zip(one, two)).toEqual([
    [1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']
  ])

  expect(zip(one, three)).toEqual([
    [1, 3], [1, 4], [2, 3], [2, 4]
  ])

  expect(zip(one, two, three)).toEqual([
    [1, 'a', 3], [1, 'a', 4], [1, 'b', 3], [1, 'b', 4],
    [2, 'a', 3], [2, 'a', 4], [2, 'b', 3], [2, 'b', 4]
  ])

  expect(randomInt(1)).toEqual(0)
  expect(randomInt(1, 1)).toEqual(1)

  repeat(50, () => expect(randomInt(5)).toBeLessThan(5))
  repeat(50, () => expect(randomInt(5, 1)).toBeLessThan(6))

  expect(repeat(3, i => `${i}!`)).toEqual(['0!', '1!', '2!'])
})

describe('chainWith', () => {
  it('do', () => {
    const composeMany = chainWith(compose)

    expect(composeMany(id)(id, id)('hi')).toEqual('hi')

    const emphasize = composeMany(x => `${x}!`)

    expect(
      emphasize()('hi')
    ).toEqual(
      'hi!'
    )

    expect(
      emphasize(x => `${x}?`)('hi')
    ).toEqual(
      'hi!?'
    )

    expect(
      emphasize(
        x => `${x}?`,
        x => x.toUpperCase()
      )('hi')
    ).toEqual(
      'HI!?'
    )
  })
})

describe('chainP', () => {
  test('default chainP', async () => {
    await chainP()(
      x => expect(x).toEqual(undefined)
    )

    await chainP('hi')(
      x => expect(x).toEqual('hi')
    )

    await chainP(Promise.resolve('hi'))(
      x => expect(x).toEqual('hi')
    )
  })
})
