'use strict'

const path = require('path')
const os = require('os')
const fs = require('fs')
const execSync = require('child_process').execSync
const semver = require('semver')

const platform = os.platform()
const arches = (process.env.ARCH || os.arch()).split(',')

const { NODE_VERSIONS = '>=12', TARGET_NAME = 'addon' } = process.env

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
  const cache = path.join(os.tmpdir(), 'prebuilds')

  fs.mkdirSync(cache, { recursive: true })

  for (const arch of arches) {
    fs.mkdirSync(`prebuilds/${platform}-${arch}`, { recursive: true })

    targets.forEach(target => {
      if (platform === 'linux' && arch === 'ia32' && semver.gte(target.version, '14.0.0')) return
      if (platform === 'win32' && arch === 'ia32' && semver.gte(target.version, '18.0.0')) return

      const output = `prebuilds/${platform}-${arch}/node-${target.abi}.node`
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

      execSync(cmd, { stdio: [0, 1, 2], shell: process.env.SHELL })

      fs.copyFileSync(`build/Release/${TARGET_NAME}.node`, output)
    })
  }
}
