const { chain, map, reduce, flatten, tap } = require('./common')
const { blend, styles, red, redBg, green, greenBg, gray, white, yellowBg, eraseLine } = require('./colors')

const boldWhite = blend(white, styles.bold)
const running = boldWhite(yellowBg(' RUNNING '))
const status = passed => boldWhite(passed ? greenBg(' PASS ') : redBg(' FAIL '))

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
          const icon = r.passed ? green('☑︎') : r.pending ? styles.bold('◻︎') : red('☒')
          const errors = r.passed || r.pending ? '' : `\n${r.errors.join('\n')}\n`
          return `    ${icon} ${gray(`${durationText}${_title[1]}`)} ${errors}`
        })]
      }),

      flatten(),

      tap(lines => lines.forEach(line => console.log(line)))
    )
  }
}

module.exports = PerfTestReporter
