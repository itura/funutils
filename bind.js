
const NormalBind = (prev, fn) => {
  return fn(prev)
}

const Nil = Symbol('nil')

const NilResult = x => {
  const emptyArray = !x || x.length === 0
  const zero = x === 0

  return !emptyArray || zero ? x : Nil
}
const NilLift = bind => (prev, fn) => {
  const monadicPrev = NilResult(prev)
  return monadicPrev === Nil
    ? Nil
    : fn(NilResult(monadicPrev))
}

const NilMonad = {
  bind: NilLift(NormalBind),
  result: NilResult,
}

const domonad = (monad, fns, initial) =>
  fns.reduce(
    (prev, fn) => monad.bind(prev, fn),
    monad.result(initial)
  )

module.exports = {
  NilMonad,
  Nil,
  domonad
}
