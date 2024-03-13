'use strict'

const semver = require('semver')

const nodeTargets = [
  { version: '12.0.0', abi: '72' },
  { version: '13.0.0', abi: '79' },
  { version: '14.0.0', abi: '83' },
  { version: '15.0.0', abi: '88' },
  { version: '16.0.0', abi: '93' },
  { version: '17.0.1', abi: '102' },
  { version: '18.0.0', abi: '108' },
  { version: '19.0.0', abi: '111' },
  { version: '20.0.0', abi: '115' },
  { version: '21.0.0', abi: '120' }
]

function getFilteredNodeTargets (semverConstraint) {
  return nodeTargets.filter((target) =>
    semver.satisfies(target.version, semverConstraint)
  )
}

module.exports = { getFilteredNodeTargets }
