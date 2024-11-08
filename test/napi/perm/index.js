'use strict'

const { execSync } = require('child_process')

const cwd = __dirname
const stdio = ['inherit', 'inherit', 'inherit']
const opts = { cwd, stdio }

execSync('touch foo.txt', opts)
