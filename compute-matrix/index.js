'use strict'

const { parseArgs } = require('node:util')

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    min: { type: 'string', default: '12' },
    max: { type: 'string', default: '20' },
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

console.log(`versions=${JSON.stringify(versions)}`)
