
module.exports = {
  array: require('./array'),
  string: require('./string'),
  number: require('./number'),
  promise: require('./promise'),
  colors: require('./colors'),
  generators: require('./generators'),
  monads: require('./monads'),
  maybe: require('./maybe'),
  result: require('./result'),
  perf: require('./perf'),
  UserJourney: require('./UserJourney'),
  ...require('./common'),
  lazyseq: require('./lazyseq')
}
