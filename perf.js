module.exports = performance => ({
  time: async (action) => {
    const t0 = performance.now()
    const result = await action()
    const t1 = performance.now()
    const durationMs = Math.ceil(t1 - t0)
    return [durationMs, result]
  }
})
