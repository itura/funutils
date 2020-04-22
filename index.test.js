/* eslint-env jest */

const { chain, map, filter, compact, flatten, reduce } = require('./')

test('funutils', () => {
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
      compact(x => x % 2 === 0)
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
})
