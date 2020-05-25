const { chain, map, reduce, flatten, tap } = require('./common')
const { Colors, ColorsWith, Gray, White, Yellow, Green, Red, fg, bg, bold, eraseLine } = require('./colors')

const lineItemText = Colors(fg(Gray))
const statusText = ColorsWith(fg(White), bold)
const running = statusText(bg(Yellow))(' RUNNING ')
const status = passed => passed
  ? statusText(bg(Green))(' PASS ')
  : statusText(bg(Red))(' FAIL ')

const greenCheck = Colors(fg(Green))('☑︎')
const redCheck = Colors(fg(Red))('☒')
const skippedCheck = Colors(bold)('◻︎')

const PerfTestReporter = function () {}

PerfTestReporter.prototype = {
  onRunStart: function (runResult) {
    process.stdout.write(`\n\n${running}`)
  },

  onTestResult: function (runConfig, fileResults, runResults) {
    const totalDuration = fileResults.perfStats.end - fileResults.perfStats.start
    const passed = fileResults.numFailingTests === 0

    process.stdout.write(`${eraseLine}\r`)
    console.log(`${status(passed)} Performance Report (${totalDuration.toFixed(0)} ms)`)

    chain(
      fileResults.testResults,

      reduce(
        (acc, r) => {
          const describes = r.ancestorTitles.join(' ')
          const existing = acc[describes]
          const [expectedDuration, title] = r.title.split('#')
          const next = {
            title,
            expectedDuration,
            duration: r.duration,
            passed: r.status === 'passed',
            pending: r.status === 'pending',
            errors: r.failureMessages
          }

          return {
            ...acc,
            [describes]: existing
              ? existing.concat(next)
              : [next]
          }
        },
        {}
      ),

      results => Object.entries(results),

      map(([description, results]) => {
        const passed = results.filter(r => !r.passed && !r.pending).length === 0

        return [`  ${status(passed)} ${description}`, ...results.map(r => {
          const actualDuration = `${r.duration}`.padEnd(5)
          const expectedDuration = r.expectedDuration.padEnd(5)
          const durationText = `${actualDuration} < ${expectedDuration} `
          const icon = r.passed ? greenCheck : r.pending ? skippedCheck : redCheck
          const errors = r.passed || r.pending ? '' : `\n${r.errors.join('\n')}\n`

          return `    ${icon} ${lineItemText(`${durationText}${r.title}`)} ${errors}`
        })]
      }),

      flatten(),

      tap(lines => lines.forEach(line => console.log(line)))
    )
  }
}

module.exports = PerfTestReporter
