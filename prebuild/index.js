'use strict'

const path = require('path')
const os = require('os')
const fs = require('fs')
const execSync = require('child_process').execSync
const semver = require('semver')
const { getFilteredNodeTargets } = require('./targets')

const platform = os.platform()
const arch = process.env.ARCH || os.arch()
const libc = process.env.LIBC || ''
const stdio = [0, 1, 2]
const shell = process.env.SHELL

const {
  NAPI = 'false',
  NAPI_RS = 'false',
  NEON = 'false',
  NODE_VERSIONS = '>=12',
  POSTBUILD = '',
  PREBUILD = '',
  DIRECTORY_PATH = '.',
  TARGET_NAME = 'addon',
  NODE_HEADERS_DIRECTORY = path.join(os.tmpdir(), 'prebuilds')
} = process.env

// https://nodejs.org/en/download/releases/
const targets = getFilteredNodeTargets(NODE_VERSIONS)

const napiTargets = {
  'linux-arm64': 'aarch64-unknown-linux-gnu',
  'linux-arm': 'armv7-unknown-linux-gnueabihf',
  'linux-x64': 'x86_64-unknown-linux-gnu',
  'linuxglibc-arm64': 'aarch64-unknown-linux-gnu',
  'linuxglibc-arm': 'armv7-unknown-linux-gnueabihf',
  'linuxglibc-x64': 'x86_64-unknown-linux-gnu',
  'linuxmusl-x64': 'x86_64-unknown-linux-musl',
  'linuxmusl-arm64': 'aarch64-unknown-linux-musl',
  'darwin-arm64': 'aarch64-apple-darwin',
  'darwin-x64': 'x86_64-apple-darwin',
  'win32-ia32': 'i686-pc-windows-msvc',
  'win32-x64': 'x86_64-pc-windows-msvc'
}

prebuildify()

function prebuildify () {
  fs.mkdirSync(NODE_HEADERS_DIRECTORY, { recursive: true })
  fs.mkdirSync(`prebuilds/${platform}${libc}-${arch}`, { recursive: true })

  if (PREBUILD) {
    execSync(PREBUILD, { stdio, shell })
  }

  if (NAPI === 'true') {
    prebuildTarget(arch, { version: targets[0].version, abi: 'napi' })
  } else if (NAPI_RS === 'true' || NEON === 'true') {
    prebuildTarget(arch, { version: targets[0].version })
  } else {
    targets.forEach(target => prebuildTarget(arch, target))
  }

  if (POSTBUILD) {
    execSync(POSTBUILD, { stdio, shell })
  }
}

function prebuildTarget (arch, target) {
  if (NAPI_RS === 'true' && platform === 'linux' && arch === 'ia32') return
  if (NEON === 'true' && platform === 'linux' && arch === 'ia32') return

  if (platform === 'linux' && arch === 'ia32' && semver.gte(target.version, '14.0.0')) return
  if (platform === 'win32' && arch === 'ia32' && semver.gte(target.version, '18.0.0')) return

  let cmd

  if (NAPI_RS === 'true') {
    installRust()

    let napiBuildCommand

    if (platform === 'win32') {
      napiBuildCommand = `npx ${__dirname + path.sep}node_modules${path.sep}@napi-rs${path.sep}cli build`
    } else {
      napiBuildCommand = `${__dirname + path.sep}node_modules${path.sep}.bin${path.sep}napi build`
    }

    cmd = `cd ${DIRECTORY_PATH} && ${napiBuildCommand} --release`
  } else if (NEON === 'true') {
    installRust()

    cmd = `cd ${DIRECTORY_PATH} && npm run build-release`
  } else {
    cmd = [
      'node-gyp rebuild',
      `--target=${target.version}`,
      `--arch=${arch}`,
      `--devdir=${NODE_HEADERS_DIRECTORY}`,
      '--release',
      '--jobs=max',
      '--build_v8_with_gn=false',
      '--v8_enable_pointer_compression=""',
      '--v8_enable_31bit_smis_on_64bit_arch=""',
      '--enable_lto=false',
      // Workaround for https://github.com/nodejs/node-gyp/issues/2750
      // taken from https://github.com/nodejs/node-gyp/issues/2673#issuecomment-1196931379
      '--openssl_fips=""'
    ].join(' ')
  }

  execSync(cmd, { stdio, shell })

  if (NAPI_RS === 'true') {
    const output = `prebuilds/${platform}${libc}-${arch}/${TARGET_NAME}.node`
    fs.copyFileSync(`${DIRECTORY_PATH}/${TARGET_NAME}.node`, output)
  } else if (NEON === 'true') {
    const output = `prebuilds/${platform}${libc}-${arch}/${TARGET_NAME}.node`
    fs.copyFileSync(`${DIRECTORY_PATH}/index.node`, output)
  } else {
    const output = `prebuilds/${platform}${libc}-${arch}/node-${target.abi}.node`
    fs.copyFileSync(`${DIRECTORY_PATH}/build/Release/${TARGET_NAME}.node`, output)
  }
}

function installRust () {
  execSync("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y", { stdio, shell })

  process.env.PATH += path.delimiter + process.env.HOME + path.sep + '.cargo' + path.sep + 'bin'
  process.env.CARGO_BUILD_TARGET = napiTargets[`${platform}${libc}-${arch}`]

  if (platform === 'linux' && libc === 'musl') {
    process.env.RUSTFLAGS = '-C target-feature=-crt-static'
  }

  execSync('rustup toolchain install nightly && rustup component add rust-src --toolchain nightly')
}
