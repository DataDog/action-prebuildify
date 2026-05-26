'use strict'

const { strictEqual } = require('assert')
const { prebuildDir, prebuildFilename } = require('../prebuild/naming')

// --- prebuildDir ---

// v3: directory encodes libc
strictEqual(prebuildDir('3', '.', 'linux', 'x64', 'glibc'), './prebuilds/linuxglibc-x64')
strictEqual(prebuildDir('3', '.', 'linux', 'x64', 'musl'), './prebuilds/linuxmusl-x64')
strictEqual(prebuildDir('3', '.', 'linux', 'arm64', 'glibc'), './prebuilds/linuxglibc-arm64')
strictEqual(prebuildDir('3', '.', 'darwin', 'arm64', ''), './prebuilds/darwin-arm64')

// v4: no libc in directory
strictEqual(prebuildDir('4', '.', 'linux', 'x64', 'glibc'), './prebuilds/linux-x64')
strictEqual(prebuildDir('4', '.', 'linux', 'x64', 'musl'), './prebuilds/linux-x64')
strictEqual(prebuildDir('4', '.', 'darwin', 'arm64', ''), './prebuilds/darwin-arm64')

// --- prebuildFilename ---

// v3 non-Rust (baseName='node'): traditional node-gyp-build convention
strictEqual(prebuildFilename('3', 'napi', 'node', ''), 'node-napi.node')
strictEqual(prebuildFilename('3', '115', 'node', ''), 'node-115.node')
strictEqual(prebuildFilename('3', '127', 'node', 'musl'), 'node-127.node')

// v3 Rust (baseName from build output): preserves original binary name
strictEqual(prebuildFilename('3', 'napi', 'process-discovery', ''), 'process-discovery-napi.node')
strictEqual(prebuildFilename('3', 'napi', 'process-discovery', 'musl'), 'process-discovery-napi.node')
strictEqual(prebuildFilename('3', 'napi', 'crashtracker', ''), 'crashtracker-napi.node')

// v4 non-Rust (baseName=TARGET_NAME): uses target name with libc tag
strictEqual(prebuildFilename('4', 'napi', 'addon', ''), 'addon.node.napi.node')
strictEqual(prebuildFilename('4', '115', 'addon', ''), 'addon.node.abi115.node')
strictEqual(prebuildFilename('4', 'napi', 'addon', 'musl'), 'addon.musl.node.napi.node')
strictEqual(prebuildFilename('4', '115', 'addon', 'musl'), 'addon.musl.node.abi115.node')

// v4 Rust (baseName from build output): uses original name with libc tag
strictEqual(prebuildFilename('4', 'napi', 'dd_pprof', ''), 'dd_pprof.node.napi.node')
strictEqual(prebuildFilename('4', 'napi', 'dd_pprof', 'musl'), 'dd_pprof.musl.node.napi.node')
