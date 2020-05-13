/* eslint-env jest */

const LazySeqM = require('./LazySeqM')
const monads = require('../monads')

describe('LazySeqM', () => {
  it('chains the mapping functions through the Something monad for each value of the generator', () => {
    const data = () => [1, 2, 3].values()

    const s1 = LazySeqM(monads.Something, data)
      .map(i => i + 1)

    expect(s1.take(4)).toEqual([2, 3, 4])
    expect(s1.take(3)).toEqual([2, 3, 4])
    expect(s1.take(2)).toEqual([2, 3])
    expect(s1.take(1)).toEqual([2])
    expect(s1.take(0)).toEqual([])

    const s2 = s1
      .map(i => `${i}`)

    expect(s2.take(4)).toEqual(['2', '3', '4'])
    expect(s2.take(3)).toEqual(['2', '3', '4'])
    expect(s2.take(2)).toEqual(['2', '3'])
    expect(s2.take(1)).toEqual(['2'])
    expect(s2.take(0)).toEqual([])

    const s3 = s2
      .map(i => i === '3' ? undefined : `${i}!`)
      .map(i => `@${i}`)

    expect(s3.take(4)).toEqual(['@2!', '@4!'])
    expect(s3.take(3)).toEqual(['@2!', '@4!'])
    expect(s3.take(2)).toEqual(['@2!'])
    expect(s3.take(1)).toEqual(['@2!'])
    expect(s3.take(0)).toEqual([])

    const s4 = s3
      .map(i => [i, i])
      .map(i => `🤪${i}`)

    expect(s4.take(4)).toEqual(['🤪@2!', '🤪@2!', '🤪@4!', '🤪@4!'])
    expect(s4.take(3)).toEqual(['🤪@2!', '🤪@2!', '🤪@4!', '🤪@4!'])
    expect(s4.take(2)).toEqual(['🤪@2!', '🤪@2!'])
    expect(s4.take(1)).toEqual(['🤪@2!', '🤪@2!'])
    expect(s4.take(0)).toEqual([])

    const s5 = s4
      .map(i => [null, undefined, '😫'])
      .map(i => `${i}!`)

    expect(s5.take(1)).toEqual([
      '😫!', '😫!'
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

  it('is immutable', () => {
    const s1 = LazySeqM(monads.Maybe)
    const s2 = s1.map(x => x + 1)
    const s3 = s2.map(x => x % 2 === 0 ? x : null)

    expect(s1.take(3)).toEqual([0, 1, 2])
    expect(s2.take(3)).toEqual([1, 2, 3])
    expect(s3.take(3)).toEqual([2])

    expect(s1.take(3)).toEqual([0, 1, 2])
    expect(s2.take(3)).toEqual([1, 2, 3])
    expect(s3.take(3)).toEqual([2])
  })
})
