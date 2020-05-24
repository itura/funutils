// Usage: node showColors.js [optionalText]

const { showColors } = require('../colors')

const args = process.argv.slice(2)

showColors(args[0])
