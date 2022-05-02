# action-prebuildify

GitHub Actions reusable workflow to generate prebuilds for a Node native add-on.

## Usage

This workflow can be used to generate Node 12 - 18 prebuilds for Linux, macOS
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
      target-name: 'addon' # target name in binding.gyp
      package-manager: 'npm' # npm or yarn
      cache: false # enable caching of dependencies based on lockfile
```
