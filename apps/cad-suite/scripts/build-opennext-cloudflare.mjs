import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd());
const lockfilePath = resolve(projectRoot, "package-lock.json");
const backupLockfilePath = resolve(projectRoot, "package-lock.opennext.backup.json");
const openNextCliCandidates = [
  resolve(projectRoot, "node_modules/@opennextjs/cloudflare/dist/cli/index.js"),
  resolve(projectRoot, "..", "..", "node_modules/@opennextjs/cloudflare/dist/cli/index.js"),
];

const openNextCliPath = openNextCliCandidates.find((candidate) => existsSync(candidate));

if (!openNextCliPath) {
  throw new Error(
    `[cf:build] Could not locate OpenNext CLI. Checked: ${openNextCliCandidates.join(", ")}`,
  );
}

function runOpenNextBuild() {
  const result = spawnSync(process.execPath, [openNextCliPath, "build", "--skipNextBuild"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

if (!existsSync(lockfilePath)) {
  process.exit(runOpenNextBuild());
}

if (existsSync(backupLockfilePath)) {
  throw new Error(
    `[cf:build] Backup lockfile already exists at ${backupLockfilePath}. Resolve it before running cf:build.`,
  );
}

renameSync(lockfilePath, backupLockfilePath);

let exitCode = 1;
try {
  exitCode = runOpenNextBuild();
} finally {
  if (existsSync(backupLockfilePath) && !existsSync(lockfilePath)) {
    renameSync(backupLockfilePath, lockfilePath);
  }
}

process.exit(exitCode);
