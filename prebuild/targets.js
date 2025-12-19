'use strict'

const semver = require('semver')

const nodeTargets = [
  { version: '12.0.0', abi: '72', alpineVersion: '~3.14' },
  { version: '13.0.0', abi: '79', alpineVersion: '~3.14' },
  { version: '14.0.0', abi: '83', alpineVersion: '~3.14' },
  { version: '15.0.0', abi: '88', alpineVersion: '~3.14' },
  { version: '16.0.0', abi: '93', alpineVersion: '~3.14' },
  { version: '17.0.1', abi: '102', alpineVersion: '~3.14' },
  { version: '18.0.0', abi: '108', alpineVersion: '~3.14' },
  { version: '19.0.0', abi: '111', alpineVersion: '~3.14' },
  { version: '20.0.0', abi: '115', alpineVersion: '~3.14' },
  { version: '21.0.0', abi: '120', alpineVersion: '~3.14' },
  { version: '22.0.0', abi: '127', alpineVersion: '~3.14' },
  { version: '23.0.0', abi: '131', alpineVersion: '~3.14' },
  { version: '24.0.0', abi: '137', alpineVersion: '~3.14' },
  { version: '25.0.0', abi: '141', alpineVersion: '~3.17' }
]

const allowedAlpineVersions = getAllowedAlpineVersions()

function getAllowedAlpineVersions () {
  const versions = new Set()
  nodeTargets.forEach(target => {
    versions.add(target.alpineVersion)
  })
  return Array.from(versions)
}

function isAlpineVersionSupported (alpineVersion) {
  return allowedAlpineVersions.some(
    versionSpec => semver.satisfies(alpineVersion, versionSpec)
  )
}

async function getFilteredNodeTargets (semverConstraint, alpineVersion) {
  if (alpineVersion !== undefined && !isAlpineVersionSupported(alpineVersion)) {
    throw new Error(`Alpine version ${alpineVersion} is not supported.`)
  }

  const filteredTargets = nodeTargets.filter((target) =>
    semver.satisfies(target.version, semverConstraint) &&
    (alpineVersion === undefined || semver.satisfies(alpineVersion, target.alpineVersion))
  )

  // Only get nightly target if NIGHTLY_VERSION env is set
  if (process.env.NIGHTLY_VERSION) {
    const nightlyTarget = await getNightlyTarget()
    filteredTargets.push(nightlyTarget)
  }

  return filteredTargets
}

async function getNightlyTarget () {
  let response
  let data
  let versions = process.env.NIGHTLY_VERSION

  if (versions === 'latest') {
    try {
      response = await fetch('https://nodejs.org/download/nightly/index.json') // eslint-disable-line no-undef
    } catch (err) {
      return
    }
    data = await response.json()
    data = data[0]
  } else {
    versions = versions.split(',').map(val => val.trim())
    data = { version: versions[0], modules: versions[1], alpineVersion: versions[2] }
  }

  return {
    version: data.version,
    abi: data.modules,
    isNightly: true,
    alpineVersion: data.alpineVersion || '~3.17'
  }
}

module.exports = { getFilteredNodeTargets }
