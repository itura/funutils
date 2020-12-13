
module.exports = {
  toExponential: digits => n => n.toExponential(digits),
  toFixed: digits => n => n.toFixed(digits),
  toLocaleString: (locale, options) => n => n.toLocaleString(locale, options),
  toPrecision: digits => n => n.toPrecision(digits),
  toString: radix => n => n.toString(radix)
}
