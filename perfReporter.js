const { chain, map, reduce, flatten, tap, compose } = require('./common')

const color = (code, fill = false, bold = false) => value =>
  `\u{1b}[${bold ? '1;' : ''}${fill ? '48' : '38'};5;${code}m${value}\u{1b}[0m`

const bold = color('0', false, true)
const red = color('160')
const redBg = color('160', true)
const green = color('34')
const greenBg = color('34', true)
const secondary = color('247')
const white = color('231')
const boldWhite = compose(bold)(white)
const running = compose(boldWhite)(color('3', true))(' RUNNING ')
const status = passed => boldWhite(passed ? greenBg(' PASS ') : redBg(' FAIL '))
const clearLine = '\u{1b}[1K\r'

const PerfTestReporter = function () {}

PerfTestReporter.prototype = {
  onRunStart: function (runResult) {
    process.stdout.write(`\n\n${running}`)
  },

  onTestResult: function (runConfig, fileResults, runResults) {
    const totalDuration = fileResults.perfStats.end - fileResults.perfStats.start
    const passed = fileResults.numFailingTests === 0

    process.stdout.write(clearLine)
    console.log(`${status(passed)} Performance Report (${totalDuration.toFixed(0)} ms)`)

    chain(
      fileResults.testResults,

      reduce(
        (acc, r) => {
          const describes = r.ancestorTitles.join(' ')
          const existing = acc[describes]
          const next = {
            title: r.title,
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
          const _title = r.title.split('#')
          const actualDuration = `${r.duration}`.padEnd(5)
          const expectedDuration = _title[0].padEnd(5)
          const durationText = `${actualDuration} < ${expectedDuration} `
          const icon = r.passed ? green('☑︎') : r.pending ? '◻︎' : red('☒')
          const errors = r.passed || r.pending ? '' : `\n${r.errors.join('\n')}\n`
          return `    ${icon} ${secondary(`${durationText}${_title[1]}`)} ${errors}`
        })]
      }),

      flatten(),

      tap(lines => lines.forEach(line => console.log(line)))
    )

    console.log()
  }

}

module.exports = PerfTestReporter
