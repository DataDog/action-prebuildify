# action-prebuildify

GitHub Actions reusable workflow to generate prebuilds for a Node native add-on.

## Usage

This workflow can be used to generate Node 12 - 19 prebuilds for Linux, macOS
and Windows. The prebuilds will be stored in the `prebuilds` folder which should
be added to `.gitignore`, and can be loaded using
[node-gyp-build](https://www.npmjs.com/package/node-gyp-build) with
`require('node-gyp-build')(__dirname)`.

Example usage with the available options and the defaults:

```yaml
jobs:
  build:
    uses: Datadog/action-prebuildify/.github/workflows/build.yml@main
    with:
      cache: false # enable caching of dependencies based on lockfile
      napi: false # generate single Node-API binary for all versions of Node
      package-manager: 'npm' # npm or yarn
      postbuild: '' # command to run after prebuilds have been generated
      prebuild: '' # command to run before prebuilds are generated
      skip: '' # list of jobs to skip, for example when a platform is not supported
      target-name: 'addon' # target name in binding.gyp
```
