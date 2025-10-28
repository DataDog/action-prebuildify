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

function getFilteredNodeTargets (semverConstraint, alpineVersion) {
  if (alpineVersion !== undefined && !isAlpineVersionSupported(alpineVersion)) {
    throw new Error(`Alpine version ${alpineVersion} is not supported.`)
  }
  return nodeTargets.filter((target) =>
    semver.satisfies(target.version, semverConstraint) &&
    (alpineVersion === undefined || semver.satisfies(alpineVersion, target.alpineVersion))
  )
}

module.exports = { getFilteredNodeTargets }
