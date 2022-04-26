'use strict'

const { strictEqual } = require('assert')

const addon = require('node-gyp-build')(__dirname)

strictEqual(addon.test(), 'success')
