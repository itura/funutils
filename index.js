const common = require('./common')

const { LazySeq, LazySeqM } = require('./lazyseq')
module.exports = {
  monads: require('./monads'),
  LazySeq,
  LazySeqM,
  ...common
}
