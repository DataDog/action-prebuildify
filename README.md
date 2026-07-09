# action-prebuildify

GitHub Actions reusable workflow to generate prebuilds for a Node native add-on.

## Usage

This workflow can be used to generate Node 18 - 26 prebuilds for Linux, macOS
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
      min-node-version: 18 # The minimum Node.js version to build and test
      nightly-version: '' # Optional Node nightly version to prebuild for GYP/V8-native add-ons.
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

## Node Nightly Prebuilds

Set `nightly-version` to manually add one Node nightly build target for testing.
This is intended for downstream GYP/V8-native add-ons that may break when Node
updates V8 or changes the Node ABI. It should be used as an opt-in compatibility
check, not as part of the regular release prebuild workflow.

Use `latest` to build against the latest published Node nightly with headers:

```yaml
with:
  nightly-version: latest
```

Use an explicit value when you need a specific nightly version or ABI:

```yaml
with:
  nightly-version: v27.0.0-nightly20260623,150,~3.17
```

The explicit format is:

```text
nodeVersion,abiVersion,alpineVersion
```

When `nightly-version` is set, the action fetches Node headers from
`https://nodejs.org/download/nightly` and produces an additional ABI-specific
prebuild, for example `node-150.node`.

This option does not add extra builds for `napi`, `napi-rs`, `neon`, or `rust`
workflows. Those modes produce a Node-API-oriented artifact and are not expected
to need a separate V8 ABI prebuild for each Node nightly.
