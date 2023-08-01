"use strict";

const retry = require("retry");
const semver = require("semver");
const { nodeTargets } = require("./targets");
const execSync = require("child_process").execSync;

const stdio = [0, 1, 2];
const shell = process.env.SHELL;

const { NODE_VERSIONS = ">=12" } = process.env;
const targets = nodeTargets.filter(target => semver.satisfies(target.version, NODE_VERSIONS))

function fetchNodeHeaders(version, devDir) {
  let operation = retry.operation({
    retries: 3,
    factor: 2,
    minTimeout: 1 * 1000,
    maxTimeout: 60 * 1000,
    randomize: true,
  });
  return new Promise((resolve, reject) => {
    operation.attempt(() => {
      const cmd = [
        "node-gyp install",
        `--target=${version}`,
        `--devdir=${devDir}`,
      ].join(" ");
      try {
        execSync(cmd, { stdio, shell });
      } catch (err) {
        if (operation.retry(err)) {
          return;
        } else if (err) {
          reject(err);
          return;
        }
      }
      resolve();
    });
  });
}

function computeNodeTargetsHash() {
  const crypto = require("crypto");
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(nodeTargets))
    .digest("hex");
  console.log(`hash=${hash}`);
}

function fetchAllNodeHeaders(targetDir) {
  for (const target of targets) {
    fetchNodeHeaders(target.version, targetDir);
  }
}

if (process.argv.length == 2) {
  computeNodeTargetsHash();
} else {
  fetchAllNodeHeaders(process.argv[2]);
}
