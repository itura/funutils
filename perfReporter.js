const { chain, tap } = require('./common')
const { map, reduce, flatten } = require('./array')
const maybe = require('./maybe')
const { Colors, ColorsWith, Gray, White, Yellow, Green, Red, fg, bg, padEnd, bold, eraseLine } = require('./colors')

const duration = Colors(padEnd(5))
const lineItemText = Colors(fg(Gray))
const statusText = ColorsWith(fg(White), bold)
const running = statusText(bg(Yellow))(' RUNNING ')
const status = passed => passed
  ? statusText(bg(Green))(' PASS ')
  : statusText(bg(Red))(' FAIL ')

const greenCheck = Colors(fg(Green))('☑︎')
const redCheck = Colors(fg(Red))('☒')
const skippedCheck = Colors(bold)('◻︎')

const displayNameText = chain(
  runConfig => maybe.dig(runConfig, 'context', 'config', 'displayName'),
  maybe.caseMap({
    just: chain(
      displayName => `  ${displayName.name}  `,
      Colors(bg(Gray), fg(White)),
      result => ` ${result}`
    ),
    nothing: () => ''
  })
)

const PerfTestReporter = function () {}

PerfTestReporter.prototype = {
  onTestStart: function (runConfig) {
    process.stdout.write(`\n\n${running}${displayNameText(runConfig)}`)
  },

  onTestResult: function (runConfig, fileResults, runResults) {
    const totalDuration = fileResults.perfStats.end - fileResults.perfStats.start
    const passed = fileResults.numFailingTests === 0

    process.stdout.write(`${eraseLine}\r`)
    console.log(`${status(passed)}${displayNameText(runConfig)} Performance Report (${totalDuration.toFixed(0)} ms)`)

    chain(
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
          const actualDuration = duration(`${r.duration}`)
          const expectedDuration = duration(r.expectedDuration)
          const durationText = `${actualDuration} < ${expectedDuration} `
          const icon = r.passed ? greenCheck : r.pending ? skippedCheck : redCheck
          const errors = r.passed || r.pending ? '' : `\n${r.errors.join('\n')}\n`

          return `    ${icon} ${lineItemText(`${durationText}${r.title}`)} ${errors}`
        })]
      }),

      flatten(),

      tap(lines => lines.forEach(line => console.log(line)))
    )(fileResults.testResults)
  }
}

module.exports = PerfTestReporter
