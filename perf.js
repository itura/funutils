// ES6 Performance interface is provided differently based on environment:
// - browser: `performance` global
// - node: `perf_hooks.performance`
//  - may eventually be available under `global.performance` https://github.com/nodejs/node/issues/28635

// eslint-disable-next-line
const p = typeof performance === 'undefined' ? require('perf_hooks').performance : performance

const time = async (action) => {
  const t0 = p.now()
  const result = await action()
  const t1 = p.now()
  const durationMs = t1 - t0
  return [durationMs, result]
}

module.exports = {
  time
}
