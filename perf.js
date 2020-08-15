const p = global.performance

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
