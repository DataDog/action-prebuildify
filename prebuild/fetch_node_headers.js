'use strict'

const retry = require('retry')
const { getFilteredNodeTargets } = require('./targets')
const execSync = require('child_process').execSync

const stdio = [0, 1, 2]
const shell = process.env.SHELL

const { NODE_VERSIONS = '>=12' } = process.env
const targets = getFilteredNodeTargets(NODE_VERSIONS)

function fetchNodeHeaders (version, devDir) {
  const operation = retry.operation({
    retries: 3,
    factor: 2,
    minTimeout: 1 * 1000,
    maxTimeout: 60 * 1000,
    randomize: true
  })
  return new Promise((resolve, reject) => {
    operation.attempt(() => {
      const cmd = [
        'node-gyp install',
        `--target=${version}`,
        `--devdir=${devDir}`
      ].join(' ')
      try {
        execSync(cmd, { stdio, shell })
      } catch (err) {
        if (operation.retry(err)) {
          return
        } else if (err) {
          reject(err)
          return
        }
      }
      resolve()
    })
  })
}

function computeNodeTargetsHash () {
  const crypto = require('crypto')
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(targets))
    .digest('hex')
  console.log(`hash=${hash}`) // eslint-disable-line no-console
}

function fetchAllNodeHeaders (targetDir) {
  for (const target of targets) {
    fetchNodeHeaders(target.version, targetDir)
  }
}

if (process.argv.length === 2) {
  computeNodeTargetsHash()
} else {
  fetchAllNodeHeaders(process.argv[2])
}
