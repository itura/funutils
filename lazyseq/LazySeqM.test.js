/* eslint-env jest */

const LazySeqM = require('./LazySeqM')
const monads = require('../monads')
const { Nothing } = require('../maybe')

describe('LazySeqM', () => {
  it('chains the mapping functions through the sequence monad for each value of the generator', () => {
    const data = () => [1, 2, 3].values()

    const monad = monads.composeM(monads.FlatSequence)(monads.Maybe)
    const transform = LazySeqM(monad, data)
      .map(i => i + 1)

    expect(transform.take(4)).toEqual([2, 3, 4])
    expect(transform.take(3)).toEqual([2, 3, 4])
    expect(transform.take(2)).toEqual([2, 3])
    expect(transform.take(1)).toEqual([2])
    expect(transform.take(0)).toEqual([])

    transform
      .map(i => `${i}`)

    expect(transform.take(4)).toEqual(['2', '3', '4'])
    expect(transform.take(3)).toEqual(['2', '3', '4'])
    expect(transform.take(2)).toEqual(['2', '3'])
    expect(transform.take(1)).toEqual(['2'])
    expect(transform.take(0)).toEqual([])

    transform
      .map(i => i === '3' ? undefined : `${i}!`)
      .map(i => `@${i}`)

    expect(transform.take(4)).toEqual(['@2!', Nothing, '@4!'])
    expect(transform.take(3)).toEqual(['@2!', Nothing, '@4!'])
    expect(transform.take(2)).toEqual(['@2!', Nothing])
    expect(transform.take(1)).toEqual(['@2!'])
    expect(transform.take(0)).toEqual([])

    transform
      .map(i => [i, i])
      .map(i => `🤪${i}`)

    expect(transform.take(4)).toEqual(['🤪@2!', '🤪@2!', Nothing, '🤪@4!', '🤪@4!'])
    expect(transform.take(3)).toEqual(['🤪@2!', '🤪@2!', Nothing, '🤪@4!', '🤪@4!'])
    expect(transform.take(2)).toEqual(['🤪@2!', '🤪@2!', Nothing])
    expect(transform.take(1)).toEqual(['🤪@2!', '🤪@2!'])
    expect(transform.take(0)).toEqual([])

    transform
      .map(i => [null, undefined, '😫'])
      .map(i => `${i}!`)

    expect(transform.take(1)).toEqual([
      Nothing, Nothing, '😫!', Nothing, Nothing, '😫!'
    ])
  })

  it('defaults to increasing integers starting at 0 as the generator', () => {
    const transform = LazySeqM(monads.FlatSequence)
      .map(i => [i + 1])

    expect(transform.take(4)).toEqual([1, 2, 3, 4])
    expect(transform.take(3)).toEqual([1, 2, 3])
    expect(transform.take(2)).toEqual([1, 2])
    expect(transform.take(1)).toEqual([1])
    expect(transform.take(0)).toEqual([])
  })

  it('can be reduced to a promise', async () => {
    const generateData = x => [x + 1, x + 2]

    const insertToDb = data => {
      const result = `Inserted ${data}`
      return Promise.resolve(result)
    }

    const transform = LazySeqM(monads.FlatSequence)
      .map(generateData)
      .map(insertToDb)

    const fireAndForget = await transform
      .reduce(
        (chain, p) => chain.then(() => p),
        Promise.resolve()
      )
      .take(2)

    expect(fireAndForget).toEqual('Inserted 3')

    const trackEverything = await transform
      .reduce(
        (chain, p) => chain.then(results =>
          p.then(r => results.concat(r))),
        Promise.resolve([])
      )
      .take(2)

    expect(trackEverything).toEqual([
      'Inserted 1',
      'Inserted 2',
      'Inserted 2',
      'Inserted 3'
    ])
  })
})
