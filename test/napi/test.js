'use strict'

const { execSync } = require('child_process')
const { hello } = require('node-gyp-build')(__dirname)

const cwd = __dirname
const stdio = ['inherit', 'inherit', 'inherit']
const uid = process.getuid()
const gid = process.getgid()
const opts = { cwd, stdio, uid, gid }

// Test that permissions work properly as there is a bug in older npm versions.
execSync('npm install', opts)

console.log(hello()) // eslint-disable-line no-console
