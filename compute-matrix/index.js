'use strict'

const { parseArgs } = require('node:util')

// Neon only supports Node >=14
const defaultMin = process.env.NEON === 'true' ? '14' : '12'

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    min: { type: 'string', default: defaultMin },
    max: { type: 'string', default: '21' },
    step: { type: 'string', default: '2' }
  }
})

const min = Number(values.min)
const max = Number(values.max)
const step = Number(values.step)

const versions = []

for (let version = min; version <= max; version += step) {
  versions.push(version)
}

if (versions[versions.length - 1] !== max) {
  versions.push(max)
}

console.log(`versions=${JSON.stringify(versions)}`)
