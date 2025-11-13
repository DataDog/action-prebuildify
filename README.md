# action-prebuildify

GitHub Actions reusable workflow to generate prebuilds for a Node native add-on.

## Usage

This workflow can be used to generate Node 12 - 25 and nightly prebuilds for Linux, macOS
and Windows. The prebuilds will be stored in the `prebuilds` folder which should
be added to `.gitignore`, and can be loaded using
[node-gyp-build](https://www.npmjs.com/package/node-gyp-build) with
`require('node-gyp-build')(__dirname)`.

> *NOTE:* Currently, `node-gyp-build` must be `<4` to work with this action.

Example usage with the available options and the defaults:

```yaml
jobs:
  build:
    uses: Datadog/action-prebuildify/.github/workflows/build.yml@main
    with:
      cache: false # enable caching of dependencies based on lockfile
      directory-path: '.' # The path to the directory containing your build files, relative to the repo root.
      min-node-version: 12 # The minimum Node.js version to build and test
      nightly-versions: '' # Full nightly node, abi and alpine versions to build (e.g., "v26.0.0-1234567890,142,~3.17" or "latest")
      napi: false # generate single Node-API binary for all versions of Node
      napi-rs: false # Whether or not this build is for a napi-rs project.
      neon: false # Whether or not this build is for a Neon project.
      package-manager: 'npm' # npm or yarn
      postbuild: '' # command to run after prebuilds have been generated
      prebuild: '' # command to run before prebuilds are generated
      rust: false # Whether or not this build is for a Rust project.
      skip: '' # list of jobs to skip, for example when a platform is not supported
      target-name: 'addon' # target name in binding.gyp (or napi.name in package.json for napi-rs projects)
```
