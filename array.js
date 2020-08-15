
const reduce = (f, initial) => a =>
  initial
    ? a.reduce(f, initial)
    : a.reduce(f)

module.exports = {
  concat: (...a2) => a1 => a1.concat(...a2),
  every: f => a => a.every(f),
  filter: f => a => a.filter(f),
  find: f => a => a.find(f),
  findIndex: f => a => a.findIndex(f),
  flatten: (n = 1) => a => a.flat(n),
  includes: x => a => a.includes(x),
  indexOf: x => a => a.indexOf(x),
  join: x => a => a.join(x),
  lastIndexOf: x => a => a.lastIndexOf(x),
  map: f => a => a.map(f),
  reduce,
  reduceRight: (f, initial) => a =>
    initial
      ? a.reduceRight(f, initial)
      : a.reduceRight(f),
  reverse: () => a => [...a].reverse(),
  slice: (start, end) => a => a.slice(start, end),
  some: f => a => a.some(f),
  sort: f => a => [...a].sort(f),

  compact: () => a => a.filter(x => x || x === 0),

  sum: (init = 0) => reduce((acc, x) => acc + x, init),
  buildLines: (init = '') => reduce((acc, x) => acc + '\n' + x, init)

}
