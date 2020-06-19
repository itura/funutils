
module.exports = {
  array: require('./array'),
  string: require('./string'),
  number: require('./number'),
  colors: require('./colors'),
  generators: require('./generators'),
  monads: require('./monads'),
  Maybe: require('./maybe'),
  perf: require('./perf'),
  UserJourney: require('./UserJourney'),
  ...require('./common'),
  ...require('./lazyseq')
}
