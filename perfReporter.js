const { chain, tap } = require('./common')
const { map, reduce, flat } = require('./array')
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
const redCheck = Colors(fg(Red))('☒ ')
const skippedCheck = Colors(bold)('◻︎')

const displayNameText = chain(
  maybe.dig('context', 'config', 'displayName'),
  maybe.map(chain(
    displayName => `  ${displayName.name}  `,
    Colors(bg(Gray), fg(White)),
    result => ` ${result}`
  )),
  maybe.unwrap({
    nothing: () => ''
  })
)

const PerfTestReporter = function () {}

PerfTestReporter.prototype = {
  onRunComplete: function (runConfig, runResults) {
    console.log()
    map(chain(
      r => r.failureMessage,
      maybe.Maybe,
      maybe.map(console.log)
    ))(runResults.testResults)
  },

  onTestStart: function (runConfig) {
    process.stdout.write(`\n\n${running}${displayNameText(runConfig)}`)
  },

  onTestResult: function (runConfig, fileResults, runResults) {
    const totalDuration = fileResults.perfStats.end - fileResults.perfStats.start
    const passed = fileResults.numFailingTests === 0 && !fileResults.failureMessage

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

          return `    ${icon} ${lineItemText(`${durationText}${r.title}`)}`
        })]
      }),

      flat(),

      tap(lines => lines.forEach(line => console.log(line)))
    )(fileResults.testResults)
  }
}

module.exports = PerfTestReporter
