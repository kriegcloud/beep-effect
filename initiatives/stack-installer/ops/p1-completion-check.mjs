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
const baseRef = argAfter("--base-ref", "origin/main");
const requiredPlatforms = ["macos", "windows"];
const requiredFiles = ["proof.json", "commands.txt", "sha256sums.txt"];
const allowedFuturePhaseStubs = new Set([
  "initiatives/stack-installer/history/outputs/p2-ai-mode-parity.md",
  "initiatives/stack-installer/history/outputs/p3-recovery.md",
  "initiatives/stack-installer/history/outputs/p4-portability.md",
  "initiatives/stack-installer/history/outputs/p5-distribution-readiness.md",
  "initiatives/stack-installer/ops/handoffs/HANDOFF_P2_AI_MODE.md",
  "initiatives/stack-installer/ops/handoffs/HANDOFF_P3_RECOVERY.md",
  "initiatives/stack-installer/ops/handoffs/HANDOFF_P4_PORTABILITY.md",
  "initiatives/stack-installer/ops/handoffs/HANDOFF_V1_RELEASE.md",
]);
const forbiddenP2ImplementationPathPatterns = [
  /^apps\/stack-installer\/src\/(?:ai-mode|ai_mode|mcp|runtime|skills?|skill-bundles?|executors?)\//i,
  /^apps\/stack-installer\/src-tauri\/src\/(?:ai-mode|ai_mode|mcp|runtime|skills?|skill-bundles?|executors?)\//i,
  /^packages\/installer\/(?:domain|use-cases|server)\/src\/(?:ai-mode|ai_mode|mcp|runtime|skills?|skill-bundles?|executors?)\//i,
  /^packages\/[^/]+\/(?:mcp|ai-mode|ai_mode|runtime|skills?|skill-bundles?|executors?)\//i,
  /^tooling\/.*(?:mcp|ai-mode|ai_mode|skill-bundle|executor)/i,
];

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

const hasTemporaryWindowsWaiver = (reviewText) =>
  /waived item:\s*Windows fresh-machine Manual Mode proof artifact/i.test(reviewText) &&
  /disposition:\s*accepted temporary waiver for P1C start only/i.test(reviewText) &&
  /owner:\s*`?@beep-team`?/i.test(reviewText) &&
  /follow-up trigger:\s*remove this waiver only after a real returned Windows/i.test(reviewText);

const changedPathsSinceBase = () => {
  const result = spawnSync("git", ["diff", "--name-status", `${baseRef}...HEAD`], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return {
      error: `${result.stderr || result.stdout}`.trim() || `git diff exited ${result.status}`,
      paths: [],
    };
  }

  return {
    error: undefined,
    paths: result.stdout
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .flatMap((line) => line.split("\t").slice(1)),
  };
};

const p2ImplementationStatus = () => {
  const changed = changedPathsSinceBase();

  if (changed.error) {
    return {
      detail: `could not inspect diff against ${baseRef}: ${changed.error}`,
      ok: false,
    };
  }

  const flaggedPaths = changed.paths.filter(
    (filePath) =>
      !allowedFuturePhaseStubs.has(filePath) &&
      forbiddenP2ImplementationPathPatterns.some((pattern) => pattern.test(filePath))
  );

  return {
    detail:
      flaggedPaths.length > 0
        ? `forbidden P2 implementation paths changed: ${flaggedPaths.join(", ")}`
        : `no forbidden P2 AI Mode/MCP/runtime implementation paths changed since ${baseRef}`,
    ok: flaggedPaths.length === 0,
  };
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
const windowsWaiverAccepted = hasTemporaryWindowsWaiver(p1ReviewText);

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
  manifest.currentTargetPhase === "P1D",
  "Active manifest target is P1D while full P1 remains open",
  `manifest currentTargetPhase=${manifest.currentTargetPhase}`
);
addCheck(p2Phase?.status === "pending", "P2 remains pending", `manifest P2 status=${p2Phase?.status ?? "missing"}`);

const p2DiffStatus = p2ImplementationStatus();

addCheck(p2DiffStatus.ok, "P2 implementation remains untouched", p2DiffStatus.detail);

for (const [fileName, label] of [
  ["stack-installer-p1-macos.tgz", "Returned macOS bundle"],
  ["stack-installer-p1-windows.zip", "Returned Windows bundle"],
]) {
  const status = await bundleStatus(fileName);

  addCheck(status.ok, label, status.detail);
}

const platformStatuses = await Promise.all(requiredPlatforms.map(platformArtifactStatus));
const [macosStatus, windowsStatus] = platformStatuses;
const p1cStartStatus =
  macosStatus.ok && (windowsStatus.ok || windowsWaiverAccepted)
    ? windowsStatus.ok
      ? {
          detail: "audited macOS and Windows proof artifacts are present",
          ok: true,
        }
      : {
          detail: "audited macOS proof artifact is present and Windows is under an accepted temporary waiver",
          ok: true,
        }
    : {
        detail: !macosStatus.ok
          ? "blocked because audited macOS proof artifact is not complete"
          : "blocked because Windows proof is incomplete and no accepted temporary waiver was found",
        ok: false,
      };

addCheck(p1cStartStatus.ok, "P1C start gate", p1cStartStatus.detail);

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
  addCheck(
    false,
    "p1:proof:audit-all",
    windowsWaiverAccepted
      ? "skipped because full P1 still requires both platform artifact directories even though P1C may start under waiver"
      : "skipped because both platform artifact directories are not complete"
  );
}

const reviewStatus = p1ReviewStatus(p1ReviewText);

addCheck(
  p1ReviewEvidence === "completed" || reviewStatus === "complete",
  "Post-proof quality-review-fix-loop",
  `manifest status=${p1ReviewEvidence}; review output status=${reviewStatus}`
);

const allComplete = checks.every((check) => check.ok);

console.log(`Stack Installer P1/P1D readiness check for ${rel(outputRoot)}`);
for (const check of checks) {
  console.log(`${check.ok ? "[pass]" : "[block]"} ${check.label}: ${check.detail}`);
}
if (!allComplete && p1cStartStatus.ok) {
  console.log("P1C may start, but full P1 completion remains blocked.");
}
console.log(
  allComplete
    ? "P1D readiness check passed; full P1 remains open until the real Windows proof is returned and audited."
    : "P1/P1D readiness check blocked."
);

if (!allComplete) {
  process.exitCode = 1;
}
