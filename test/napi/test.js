'use strict'

const { execSync } = require('child_process')
const { hello } = require('node-gyp-build')(__dirname)

// Test that permissions work properly as there is a bug in older npm versions.
execSync('touch perm/foo.txt')

console.log(hello()) // eslint-disable-line no-console
