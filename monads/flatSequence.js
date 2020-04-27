
const unit = x => {
  return [x]
}

const flatBind = (xs, f) =>
  xs
    .map(x => f(x))
    .flat()

const caseMap = cases => seq => {
  if (seq.length === 1) {
    if (Array.isArray(seq[0])) {
      return cases.flatten(seq[0])
    } else {
      return cases.unit(seq[0])
    }
  } else {
    return cases.flatten(seq)
  }
}

const bind = f => Mx => {
  return caseMap({
    unit: x => f(x),
    flatten: xs => flatBind(xs, f)
  })(Mx)
}

const FlatSequenceMonad = {
  unit,
  bind
}

module.exports = FlatSequenceMonad
