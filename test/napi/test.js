'use strict'

const { execSync } = require('child_process')
const { hello } = require('node-gyp-build')(__dirname)

console.log(hello()) // eslint-disable-line no-console

// Test that permissions work properly as there is a bug in older npm versions.
execSync('touch foo.txt')
