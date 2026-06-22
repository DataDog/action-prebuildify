'use strict'

const semver = require('semver')

const nodeTargets = [
  { version: '18.0.0', abi: '108', alpineVersion: '~3.14' },
  { version: '19.0.0', abi: '111', alpineVersion: '~3.14' },
  { version: '20.0.0', abi: '115', alpineVersion: '~3.14' },
  { version: '21.0.0', abi: '120', alpineVersion: '~3.14' },
  { version: '22.0.0', abi: '127', alpineVersion: '~3.14' },
  { version: '23.0.0', abi: '131', alpineVersion: '~3.14' },
  { version: '24.0.0', abi: '137', alpineVersion: '~3.14' },
  { version: '25.0.0', abi: '141', alpineVersion: '~3.17' },
  { version: '26.0.0', abi: '147', alpineVersion: '~3.17' }
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
