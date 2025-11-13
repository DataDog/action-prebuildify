'use strict'

const retry = require('retry')
const { getFilteredNodeTargets } = require('./targets')
const execSync = require('child_process').execSync

const stdio = [0, 1, 2]
const shell = process.env.SHELL

const { NODE_VERSIONS = '>=12' } = process.env

async function initializeTargets () {
  return await getFilteredNodeTargets(NODE_VERSIONS)
}

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
      let cmd
      const isNightly = version.includes('nightly')

      if (isNightly) {
        cmd = [
          'node-gyp install',
          '--dist-url=https://nodejs.org/download/nightly',
          `--target=${version}`,
          `--devdir=${devDir}`
        ].join(' ')
      } else {
        cmd = [
          'node-gyp install',
          `--target=${version}`,
          `--devdir=${devDir}`
        ].join(' ')
      }

      try {
        execSync(cmd, { stdio, shell })
      } catch (err) {
        if (isNightly) {
          console.log('Failed to execute nightly: ', err) // eslint-disable-line no-console
          return
        }
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

function computeNodeTargetsHash (targets) {
  const crypto = require('crypto')
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(targets))
    .digest('hex')
  console.log(`hash=${hash}`) // eslint-disable-line no-console
}

async function fetchAllNodeHeaders (targets, targetDir) {
  for (const target of targets) {
    fetchNodeHeaders(target.version, targetDir)
  }
}

async function main () {
  const targets = await initializeTargets()

  if (process.argv.length === 2) {
    computeNodeTargetsHash(targets)
  } else {
    await fetchAllNodeHeaders(targets, process.argv[2])
  }
}

main().catch((err) => {
  console.error(err) // eslint-disable-line no-console
  process.exit(1)
})
