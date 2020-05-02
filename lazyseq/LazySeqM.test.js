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

    expect(transform.take(4)).toEqual(['@2!', '@4!'])
    expect(transform.take(3)).toEqual(['@2!', '@4!'])
    expect(transform.take(2)).toEqual(['@2!'])
    expect(transform.take(1)).toEqual(['@2!'])
    expect(transform.take(0)).toEqual([])

    transform
      .map(i => [i, i])
      .map(i => `🤪${i}`)

    expect(transform.take(4)).toEqual(['🤪@2!', '🤪@2!', '🤪@4!', '🤪@4!'])
    expect(transform.take(3)).toEqual(['🤪@2!', '🤪@2!', '🤪@4!', '🤪@4!'])
    expect(transform.take(2)).toEqual(['🤪@2!', '🤪@2!'])
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
})
