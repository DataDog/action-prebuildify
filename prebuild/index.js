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
  NAPI_RS = 'false',
  NODE_VERSIONS = '>=12',
  POSTBUILD = '',
  PREBUILD = '',
  TARGET_NAME = 'addon',
  DIRECTORY_PATH = '.',
} = process.env

console.log("platofrm: " + platform)

const targets = [
  { version: '12.0.0', abi: '72' },
  { version: '13.0.0', abi: '79' },
  { version: '14.0.0', abi: '83' },
  { version: '15.0.0', abi: '88' },
  { version: '16.0.0', abi: '93' },
  { version: '17.0.1', abi: '102' },
  { version: '18.0.0', abi: '108' },
  { version: '19.0.0', abi: '111' }
]

// https://nodejs.org/en/download/releases/
if (NAPI_RS === 'false') {
  targets.filter(target => semver.satisfies(target.version, NODE_VERSIONS))
}

prebuildify()

function prebuildify () {
  fs.mkdirSync(cache, { recursive: true })
  fs.mkdirSync(`prebuilds/${platform}${libc}-${arch}`, { recursive: true })

  if (PREBUILD) {
    execSync(PREBUILD, { stdio, shell })
  }

  if (NAPI === 'true') {
    prebuildTarget(arch, { version: targets[0].version, abi: 'napi' })
  } else if (NAPI_RS === 'true') {
    prebuildTarget(arch, {})
  } else {
    targets.forEach(target => prebuildTarget(arch, target))
  }

  if (POSTBUILD) {
    execSync(POSTBUILD, { stdio, shell })
  }
}

function prebuildTarget (arch, target) {
  console.log('arch: ' + arch)
  console.log('target: ' + target)
  if (NAPI_RS === 'true' && (platform !== 'linux' && platform !== 'darwin')) return
  if (NAPI_RS === 'true' && (arch !== 'arm64' && arch !== 'x64')) return
  if (NAPI_RS === 'true' && platform === 'linux' && libc === 'musl') return
  if (platform === 'linux' && arch === 'ia32' && semver.gte(target.version, '14.0.0')) return
  if (platform === 'win32' && arch === 'ia32' && semver.gte(target.version, '18.0.0')) return

  let cmd;

  // only support building for linux and darwin, arm64 and x64
  if (NAPI_RS === 'true') {
    let build_target;
    if (platform === 'linux') {
      execSync("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y", { stdio, shell })
      process.env["PATH"] += path.delimiter + process.env["HOME"] + path.sep + ".cargo" + path.sep + "bin"

      if (arch === 'arm64') {
        build_target = 'aarch64-unknown-linux-gnu'
      } else { // arch === 'x64'
        build_target = 'x86_64-unknown-linux-gnu'
      }
    } else { // platform === 'darwin'
      if (arch === 'arm64') {
        build_target = 'aarch64-apple-darwin'
      } else { // arch === 'x64'
        build_target = 'x86_64-apple-darwin'
      }
    }
    cmd = [
      `rustup target add ${build_target} &&`,
      `cd ${DIRECTORY_PATH} &&`,
      'napi build --release',
      `--target=${build_target}`,
    ].join(' ')
  } else {
    cmd = [
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
  }

  console.log("process env before running cmd")
  console.log(process.env)

  execSync(cmd, { stdio, shell })

  if (NAPI_RS === 'true') {
    console.log("looking for: " + `${DIRECTORY_PATH}/${TARGET_NAME}.node`);
    const output = `prebuilds/${platform}${libc}-${arch}/${TARGET_NAME}.node`
    fs.copyFileSync(`${DIRECTORY_PATH}/${TARGET_NAME}.node`, output)
  } else {
    const output = `prebuilds/${platform}${libc}-${arch}/node-${target.abi}.node`
    fs.copyFileSync(`build/Release/${TARGET_NAME}.node`, output)
  }
}
