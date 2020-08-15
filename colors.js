const { chain, repeat, compose, Builder, id } = require('./common')
const { map } = require('./array')
const string = require('./string')

// http://ascii-table.com/ansi-escape-sequences.php
const ESC = '\u{1b}['
const eraseLine = `${ESC}1K`
const eraseDisplay = `${ESC}2J`
const cursor = (line, column) => `${ESC}${line};${column}H`
const cursorUp = x => `${ESC}${x}A`
const cursorDown = x => `${ESC}${x}B`
const cursorForward = x => `${ESC}${x}C`
const cursorBack = x => `${ESC}${x}D`

// https://misc.flogisoft.com/bash/tip_colors_and_formatting
const _color = ({ code, fill, style }) => value =>
  `${ESC}${style ? `${style};` : ''}${fill ? '48' : '38'};5;${code}m${value}${ESC}0m`

const _plain = ({ style }) => value => style
  ? `${ESC}${style}m${value}${ESC}0m`
  : value

const styleCodes = {
  Bold: 1,
  Dim: 2,
  Underline: 4,
  Blink: 5,
  Reverse: 7,
  Hidden: 8
}

const colorCodes = {
  Black: 0,
  Red: 1,
  Yellow: 3,
  Blue: 21,
  Green: 34,
  Teal: 51,
  Purple: 90,
  Pink: 165,
  White: 231,
  DarkGray: 242,
  Gray: 247,
  LightGray: 254
}

const Color = (config = {}) => {
  const fg = config.fg
  const bg = config.bg
  const style = config.style
  const pad = config.pad || id

  const withPad = (...fs) => chain(...map(compose)(fs))(pad)

  if (fg !== undefined && bg !== undefined) {
    return withPad(
      _color({ code: bg, fill: true }),
      _color({ code: fg, fill: false, style })
    )
  }

  if (fg !== undefined) {
    return withPad(_color({ code: fg, fill: false, style }))
  }

  if (bg !== undefined) {
    return withPad(_color({ code: bg, fill: true, style }))
  }

  return withPad(_plain({ style }))
}

const [Colors, ColorsWith, ColorF] = Builder(Color)

const fg = code => () => ({ fg: code })
const bg = code => () => ({ bg: code })
const padStart = n => () => ({ pad: string.padStart(n) })
const padEnd = n => () => ({ pad: string.padEnd(n) })
const style = code => () => ({ style: code })

const bold = () => ({ style: styleCodes.Bold })
const dim = () => ({ style: styleCodes.Dim })
const underline = () => ({ style: styleCodes.Underline })
const reverse = () => ({ style: styleCodes.Reverse })

const showColors = (text = 'boop') => {
  if (text.length < 4) throw new TypeError('Provide text at least 4 characters long')

  const header = Colors(bold, fg(colorCodes.White), bg(colorCodes.Purple))
  const column = v => `|${v}`.padEnd((text.length + 1) * 2)
  const columnHeaders = `color${column('normal')}${column('bold')}${column('underline')}${column('dim')}`
  const title = 'ANSI/VT100 Control Sequences (256 colors)'.padEnd(columnHeaders.length)

  console.log(header(title))
  console.log(header(columnHeaders))

  repeat(256, i => {
    const current = ColorsWith(fg(i))
    const currentBg = ColorsWith(fg(colorCodes.White), bg(i))
    const variations = [
      current(),
      currentBg(),
      current(bold),
      currentBg(bold),
      current(underline),
      currentBg(underline),
      current(dim),
      currentBg(dim)
    ]

    console.log(
      i.toString().padEnd(5),
      ...map(v => v(text))(variations)
    )
  })
}

module.exports = {
  Color,
  Colors,
  ColorsWith,
  ColorF,

  fg,
  bg,
  ...colorCodes,

  style,
  ...styleCodes,
  dim,
  underline,
  reverse,
  bold,

  padEnd,
  padStart,

  ESC,
  eraseLine,
  eraseDisplay,
  cursor,
  cursorUp,
  cursorDown,
  cursorForward,
  cursorBack,
  showColors
}
