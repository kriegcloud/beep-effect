#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

const argAfter = (name, fallback) => {
  const index = args.indexOf(name);

  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const repoRoot = path.resolve(import.meta.dirname, "..", "..", "..");
const initiativeRoot = path.join(repoRoot, "initiatives", "stack-installer");
const outputRoot = path.resolve(argAfter("--output-root", path.join(repoRoot, "output", "stack-installer", "p1-live")));
const requiredPlatforms = ["macos", "windows"];
const requiredFiles = ["proof.json", "commands.txt", "sha256sums.txt"];

const rel = (filePath) => path.relative(repoRoot, filePath) || ".";

const readText = async (filePath) => fs.promises.readFile(filePath, "utf8").catch(() => "");

const exists = async (filePath) =>
  fs.promises
    .access(filePath)
    .then(() => true)
    .catch(() => false);

const readJson = async (filePath) => JSON.parse(await fs.promises.readFile(filePath, "utf8"));

const checks = [];

const addCheck = (ok, label, detail) => {
  checks.push({ ok, label, detail });
};

const p1ReviewStatus = (reviewText) => {
  if (/^Status:\s*(complete|completed)/im.test(reviewText)) {
    return "complete";
  }

  if (/^Status:\s*pending/im.test(reviewText)) {
    return "pending";
  }

  return "unknown";
};

const platformArtifactStatus = async (platform) => {
  const platformDir = path.join(outputRoot, platform);

  if (!(await exists(platformDir))) {
    return {
      detail: `missing directory: ${rel(platformDir)}`,
      ok: false,
    };
  }

  const entries = await fs.promises.readdir(platformDir).catch(() => []);
  const missing = requiredFiles.filter((fileName) => !entries.includes(fileName));

  if (!entries.some((entry) => entry.startsWith("screencast."))) {
    missing.push("screencast.*");
  }

  return {
    detail:
      missing.length > 0 ? `missing ${missing.join(", ")} in ${rel(platformDir)}` : `present: ${rel(platformDir)}`,
    ok: missing.length === 0,
  };
};

const bundleStatus = async (fileName) => {
  const filePath = path.join(outputRoot, fileName);

  return {
    detail: (await exists(filePath)) ? `present: ${rel(filePath)}` : `missing: ${rel(filePath)}`,
    ok: await exists(filePath),
  };
};

const manifest = await readJson(path.join(initiativeRoot, "ops", "manifest.json"));
const p1ReviewText = await readText(path.join(initiativeRoot, "history", "outputs", "p1-pr-readiness-review.md"));
const p2Phase = manifest.phases.find((phase) => phase.id === "P2");
const p1aEvidence = manifest.completionEvidence?.p1a?.status;
const p1LiveEvidence = manifest.completionEvidence?.p1LiveHarness?.status;
const p1ReviewEvidence = manifest.completionEvidence?.p1PrReadinessReview?.status;

addCheck(
  p1aEvidence === "completed",
  "P1A committed evidence",
  `manifest completionEvidence.p1a.status=${p1aEvidence}`
);
addCheck(
  p1LiveEvidence === "implemented",
  "P1 live harness evidence",
  `manifest completionEvidence.p1LiveHarness.status=${p1LiveEvidence}`
);
addCheck(
  manifest.currentTargetPhase === "P1",
  "Active manifest target remains P1",
  `manifest currentTargetPhase=${manifest.currentTargetPhase}`
);
addCheck(p2Phase?.status === "pending", "P2 remains pending", `manifest P2 status=${p2Phase?.status ?? "missing"}`);

for (const [fileName, label] of [
  ["stack-installer-p1-macos.tgz", "Returned macOS bundle"],
  ["stack-installer-p1-windows.zip", "Returned Windows bundle"],
]) {
  const status = await bundleStatus(fileName);

  addCheck(status.ok, label, status.detail);
}

const platformStatuses = await Promise.all(requiredPlatforms.map(platformArtifactStatus));

for (const [index, platform] of requiredPlatforms.entries()) {
  const status = platformStatuses[index];

  addCheck(status.ok, `${platform} proof artifact directory`, status.detail);
}

if (platformStatuses.every((status) => status.ok)) {
  const result = spawnSync(
    "bun",
    ["run", "--filter", "@beep/stack-installer", "p1:proof:audit-all", "--", "--output-root", outputRoot],
    {
      cwd: repoRoot,
      encoding: "utf8",
    }
  );
  const output = `${result.stdout}\n${result.stderr}`.trim().split(/\r?\n/).slice(-8).join(" | ");

  addCheck(result.status === 0, "p1:proof:audit-all", output || `exit=${result.status}`);
} else {
  addCheck(false, "p1:proof:audit-all", "skipped because both platform artifact directories are not complete");
}

const reviewStatus = p1ReviewStatus(p1ReviewText);

addCheck(
  p1ReviewEvidence === "completed" || reviewStatus === "complete",
  "Post-proof quality-review-fix-loop",
  `manifest status=${p1ReviewEvidence}; review output status=${reviewStatus}`
);

const allComplete = checks.every((check) => check.ok);

console.log(`Stack Installer P1 completion check for ${rel(outputRoot)}`);
for (const check of checks) {
  console.log(`${check.ok ? "[pass]" : "[block]"} ${check.label}: ${check.detail}`);
}
console.log(allComplete ? "P1 completion check passed." : "P1 completion check blocked.");

if (!allComplete) {
  process.exitCode = 1;
}
