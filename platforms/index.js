'use strict'

const { parseArgs } = require('node:util')

const systems = ['darwin', 'linux', 'linuxglibc', 'linuxmusl', 'win32']
const architectures = ['arm', 'arm64', 'ia32', 'x64']
const platforms = systems.flatMap(s => architectures.map(a => `${s}-${a}`))

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    skip: { type: 'string', default: '' },
    only: { type: 'string', default: '' }
  }
})

function match (platform, filter) {
  return filter
    .map(f => f.replace('windows', 'win32').replace('macos', 'darwin'))
    .find(f => platform === f || platform.startsWith(filter) || platform.endsWith(filter))
}

function output (platforms) {
  // eslint-disable-next-line no-console
  console.log(`platforms=${JSON.stringify(platforms)}`)
}

if (values.only) {
  const only = values.only.split(',')

  output(platforms.filter(p => match(p, only)))
} else if (values.skip) {
  const skip = values.skip.split(',')

  output(platforms.filter(p => !match(p, skip)))
} else {
  output(platforms)
}
