const { repeat, chain, compose } = require('./common')

// https://misc.flogisoft.com/bash/tip_colors_and_formatting

const ESC = '\u{1b}['
const _color = (code, fill = false) => value =>
  `${ESC}${fill ? '48' : '38'};5;${code}m${value}${ESC}0m`

const color = code => [_color(code, false), _color(code, true)]

const style = code => value => `${ESC}${code};38;5;0m${value}${ESC}0m`
const styles = {
  bold: style(1),
  dim: style(2),
  underline: style(4),
  reverse: style(7)
}

// http://ascii-table.com/ansi-escape-sequences.php
const eraseLine = `${ESC}1K`
const eraseDisplay = `${ESC}2J`
const cursor = (line, column) => `${ESC}${line};${column}H`
const cursorUp = x => `${ESC}${x}A`
const cursorDown = x => `${ESC}${x}B`
const cursorForward = x => `${ESC}${x}C`
const cursorBack = x => `${ESC}${x}D`

const [red, redBg] = color(160)
const [green, greenBg] = color(34)
const [gray, grayBg] = color(247)
const [white, whiteBg] = color(231)
const [yellow, yellowBg] = color(3)
const [purple, purpleBg] = color(90)

const blend = (f, ...fs) => chain(f, ...fs.map(compose))

const showColors = (text = 'boop') => {
  if (text.length < 4) throw new TypeError('Provide text at least 4 characters long')

  const header = blend(purpleBg, white, styles.bold)
  const column = v => `|${v}`.padEnd((text.length + 1) * 2)
  const columnHeaders = `color${column('normal')}${column('bold')}${column('underline')}${column('dim')}`
  const title = 'ANSI/VT100 Control Sequences (256 colors)'.padEnd(columnHeaders.length)

  console.log(header(title))
  console.log(header(columnHeaders))

  repeat(256, i => {
    const [current, currentBg] = color(i)
    const coloredText = current(text)
    const coloredBg = white(currentBg(text))

    console.log(
      i.toString().padEnd(5),
      coloredText,
      coloredBg,
      styles.bold(coloredText),
      styles.bold(coloredBg),
      styles.underline(coloredText),
      styles.underline(coloredBg),
      styles.dim(coloredText),
      styles.dim(coloredBg)
    )
  })
}

module.exports = {
  color,
  styles,
  blend,
  eraseLine,
  eraseDisplay,
  cursor,
  cursorUp,
  cursorDown,
  cursorForward,
  cursorBack,
  showColors,
  red,
  redBg,
  green,
  greenBg,
  gray,
  grayBg,
  white,
  whiteBg,
  yellow,
  yellowBg,
  purple,
  purpleBg
}
