/* eslint-env jest */

const { chain, map, filter, compact, flatten, reduce, zip, randomInt, repeat } = require('./common')

test('common', () => {
  expect(
    chain(
      [1, 2, 3]
    )
  ).toEqual(
    [1, 2, 3]
  )

  expect(
    chain(
      [1, 2, 3],
      map(x => x + 1)
    )
  ).toEqual(
    [2, 3, 4]
  )

  expect(
    chain(
      [1, 2, 3],
      filter(x => x % 2 === 0)
    )
  ).toEqual(
    [2]
  )

  expect(
    chain(
      [0, 1, 2, 3, [], undefined, null, ''],
      compact()
    )
  ).toEqual(
    [0, 1, 2, 3, []]
  )

  expect(
    chain(
      [1, [2], [[3]]],
      flatten()
    )
  ).toEqual(
    [1, 2, [3]]
  )

  expect(
    chain(
      [1, 2, 3],
      reduce((sum, x) => sum + x, 0)
    )
  ).toEqual(
    6
  )

  expect(
    chain(
      [1, undefined, 2, [3], 4],
      compact(),
      flatten(),
      filter(x => x < 4),
      map(x => x - 1),
      reduce((sum, x) => sum + x, 0)
    )
  ).toEqual(
    3
  )

  const one = [1, 2]
  const two = ['a', 'b']
  const three = [['!', '?']]

  expect(zip(one, two)).toEqual(
    [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
  )

  expect(zip(one, three)).toEqual(
    [[1, ['!', '?']], [2, ['!', '?']]]
  )

  expect(zip(one, two, three)).toEqual([
    [[1, 'a'], ['!', '?']],
    [[1, 'b'], ['!', '?']],
    [[2, 'a'], ['!', '?']],
    [[2, 'b'], ['!', '?']]
  ])

  expect(randomInt(1)).toEqual(0)
  expect(randomInt(1, 1)).toEqual(1)

  repeat(50, () => expect(randomInt(5) < 5).toEqual(true))
  repeat(50, () => expect(randomInt(5, 1) < 6).toEqual(true))

  expect(repeat(3, i => `${i}!`)).toEqual(['0!', '1!', '2!'])
})
