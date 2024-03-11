'use strict'

// Neon only supports Node >=14
if (process.versions.node.split('.')[0] >= '14') {
  const { hello } = require('node-gyp-build')(__dirname)

  console.log(hello()) // eslint-disable-line no-console
}
