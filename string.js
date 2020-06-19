
module.exports = {
  includes: s2 => s1 => s1.includes(s2),
  match: r => s => s.match(r),
  matchAll: r => s => s.matchAll(r),
  normalize: form => s => s.normalize(form),
  padEnd: n => s => s.padEnd(n),
  padStart: n => s => s.padStart(n),
  repeat: n => s => s.repeat(n),
  replace: (pattern, s2) => s1 => s1.replace(pattern, s2),
  replaceAll: (pattern, s2) => s1 => s1.replaceAll(pattern, s2),
  slice: (start, end) => s => s.slice(start, end),
  split: s2 => s1 => s1.split(s2),
  startsWith: (s2, position = 0) => s1 => s1.startsWith(s2, position),
  substring: (start, end) => s => s.substring(start, end),
  toLocaleLowerCase: () => s => s.toLocaleLowerCase(),
  toLocaleUpperCase: () => s => s.toLocaleUpperCase(),
  toLowerCase: () => s => s.toLowerCase(),
  toString: () => s => s.toString(),
  toUpperCase: () => s => s.toUpperCase(),
  trim: () => s => s.trim(),
  trimEnd: () => s => s.trimEnd(),
  trimStart: () => s => s.trimStart()
}
