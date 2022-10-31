'use strict'

const path = require('path')
const os = require('os')
const fs = require('fs')
const execSync = require('child_process').execSync
const semver = require('semver')

const platform = os.platform()
const arch = process.env.ARCH || os.arch()
const libc = process.env.LIBC || ''
const cache = path.join(os.tmpdir(), 'prebuilds')
const stdio = [0, 1, 2]
const shell = process.env.SHELL

const {
  NAPI = 'false',
  NODE_VERSIONS = '>=12',
  POSTBUILD = '',
  PREBUILD = '',
  TARGET_NAME = 'addon'
} = process.env

// https://nodejs.org/en/download/releases/
const targets = [
  { version: '12.0.0', abi: '72' },
  { version: '13.0.0', abi: '79' },
  { version: '14.0.0', abi: '83' },
  { version: '15.0.0', abi: '88' },
  { version: '16.0.0', abi: '93' },
  { version: '17.0.1', abi: '102' },
  { version: '18.0.0', abi: '108' },
  { version: '19.0.0', abi: '111' }
].filter(target => semver.satisfies(target.version, NODE_VERSIONS))

prebuildify()

function prebuildify () {
  fs.mkdirSync(cache, { recursive: true })
  fs.mkdirSync(`prebuilds/${platform}${libc}-${arch}`, { recursive: true })

  if (PREBUILD) {
    execSync(PREBUILD, { stdio, shell })
  }

  if (NAPI === 'true') {
    prebuildTarget(arch, { version: targets[0].version, abi: 'napi' })
  } else {
    targets.forEach(target => prebuildTarget(arch, target))
  }

  if (POSTBUILD) {
    execSync(POSTBUILD, { stdio, shell })
  }
}

function prebuildTarget (arch, target) {
  if (platform === 'linux' && arch === 'ia32' && semver.gte(target.version, '14.0.0')) return
  if (platform === 'win32' && arch === 'ia32' && semver.gte(target.version, '18.0.0')) return

  const output = `prebuilds/${platform}${libc}-${arch}/node-${target.abi}.node`
  const cmd = [
    'node-gyp rebuild',
    `--target=${target.version}`,
    `--target_arch=${arch}`,
    `--arch=${arch}`,
    `--devdir=${cache}`,
    '--release',
    '--jobs=max',
    '--build_v8_with_gn=false',
    '--v8_enable_pointer_compression=""',
    '--v8_enable_31bit_smis_on_64bit_arch=""',
    '--enable_lto=false'
  ].join(' ')

  execSync(cmd, { stdio, shell })

  fs.copyFileSync(`build/Release/${TARGET_NAME}.node`, output)
}
