'use strict'

// Prebuild directory and filename conventions differ between node-gyp-build v3 and v4:
//
// v3: prebuilds/${platform}${libc}-${arch}/${baseName}-${abi}.node
//     e.g. prebuilds/linuxglibc-arm64/node-115.node
//          prebuilds/linuxmusl-x64/process-discovery-napi.node
//
// v4: prebuilds/${platform}-${arch}/${baseName}[.musl].node.[napi|abi${N}].node
//     e.g. prebuilds/linux-arm64/dd_pprof.node.abi115.node
//          prebuilds/linux-arm64/dd_pprof.musl.node.napi.node
//
// When nodeGypBuildMajor=4, libc is encoded as a filename tag ('musl' only;
// glibc is the default and needs no tag) rather than in the directory name.

function prebuildDir (nodeGypBuildMajor, directoryPath, platform, arch, libc) {
  if (nodeGypBuildMajor === '4') {
    return `${directoryPath}/prebuilds/${platform}-${arch}`
  }
  return `${directoryPath}/prebuilds/${platform}${libc}-${arch}`
}

function prebuildFilename (nodeGypBuildMajor, abi, baseName, libc) {
  if (nodeGypBuildMajor === '4') {
    const libcTag = libc === 'musl' ? '.musl' : ''
    const abiTag = abi === 'napi' ? '.napi' : `.abi${abi}`
    return `${baseName}${libcTag}.node${abiTag}.node`
  }
  if (abi === 'napi') {
    return `${baseName}-napi.node`
  }
  return `${baseName}-${abi}.node`
}

module.exports = { prebuildDir, prebuildFilename }
