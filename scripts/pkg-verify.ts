#!/usr/bin/env bun
/**
 * pkg-verify - fast inner-loop verification for a single workspace package.
 *
 * Runs a package's `beep:lint`, `beep:check`, and `beep:test` scripts in
 * parallel, prints a compact one-line summary, and on failure prints the FULL
 * captured output of only the failed step(s). Near-silent on success.
 *
 * Usage (from repo root):
 *   bun run pkg:verify @beep/nlp          # lint + check + test
 *   bun run pkg:verify:quick @beep/nlp    # lint + check (no tests)
 *   bun run pkg:verify                     # auto-detect the changed package
 *
 * Exit code is non-zero if any run step failed (so it composes in CI / && chains).
 */
import { execSync, spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface PackageEntry {
  readonly dir: string;
  readonly name: string;
  readonly scripts: Readonly<Record<string, string>>;
}

const SKIP_DIRS = new Set(["node_modules", "dist", ".turbo", ".next", "coverage", ".git", "docs"]);

/** Walk packages/ and apps/ collecting every workspace package.json. */
const collectPackages = (): ReadonlyArray<PackageEntry> => {
  const out: Array<PackageEntry> = [];
  const walk = (absDir: string): void => {
    let entries: ReadonlyArray<{ name: string; isDirectory: () => boolean; isFile: () => boolean }>;
    try {
      entries = readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    const pkgJson = entries.find((e) => e.isFile() && e.name === "package.json");
    if (pkgJson !== undefined) {
      try {
        const parsed = JSON.parse(readFileSync(join(absDir, "package.json"), "utf8"));
        if (typeof parsed.name === "string") {
          out.push({ name: parsed.name, dir: absDir, scripts: parsed.scripts ?? {} });
        }
      } catch {
        // ignore malformed package.json
      }
      // do not descend into a package's own subtree once found
      return;
    }
    for (const e of entries) {
      if (e.isDirectory() && !SKIP_DIRS.has(e.name)) {
        walk(join(absDir, e.name));
      }
    }
  };
  for (const root of ["packages", "apps", "infra"]) {
    walk(join(repoRoot, root));
  }
  return out;
};

/** Detect the unique package touched by the current git working tree + index. */
const autoDetectPackage = (packages: ReadonlyArray<PackageEntry>): string | undefined => {
  let changed: ReadonlyArray<string>;
  try {
    const out = execSync("git status --porcelain", { cwd: repoRoot, encoding: "utf8" });
    changed = out
      .split("\n")
      .map((line) => line.slice(3).trim())
      .filter((p) => p.length > 0);
  } catch {
    return undefined;
  }
  const hits = new Set<string>();
  for (const file of changed) {
    const abs = resolve(repoRoot, file);
    for (const pkg of packages) {
      if (abs.startsWith(`${pkg.dir}/`)) {
        hits.add(pkg.name);
      }
    }
  }
  return hits.size === 1 ? [...hits][0] : undefined;
};

interface StepResult {
  readonly durationMs: number;
  readonly ok: boolean;
  readonly output: string;
  readonly skipped: boolean;
  readonly step: string;
}

const runStep = (step: string, script: string, pkg: PackageEntry, startMs: number): Promise<StepResult> =>
  new Promise((res) => {
    if (pkg.scripts[script] === undefined) {
      res({ step, ok: true, skipped: true, durationMs: 0, output: `(no ${script} script)` });
      return;
    }
    const child = spawn("bun", ["run", script], { cwd: pkg.dir, env: process.env });
    let buf = "";
    child.stdout.on("data", (d) => {
      buf += d.toString();
    });
    child.stderr.on("data", (d) => {
      buf += d.toString();
    });
    child.on("close", (code) => {
      res({ step, ok: code === 0, skipped: false, durationMs: Date.now() - startMs, output: buf });
    });
    child.on("error", (err) => {
      res({ step, ok: false, skipped: false, durationMs: Date.now() - startMs, output: String(err) });
    });
  });

const fmtSecs = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const quick = argv.includes("--quick");
  const pkgArg = argv.find((a) => !a.startsWith("--"));

  const packages = collectPackages();
  const target = pkgArg ?? autoDetectPackage(packages);

  if (target === undefined) {
    process.stderr.write(
      "pkg-verify: no package specified and could not auto-detect a unique changed package.\n" +
        "  usage: bun run pkg:verify <@beep/pkg-name>\n"
    );
    process.exit(2);
  }

  const pkg = packages.find((p) => p.name === target);
  if (pkg === undefined) {
    process.stderr.write(`pkg-verify: unknown package "${target}".\n`);
    process.exit(2);
  }

  const steps: ReadonlyArray<readonly [string, string]> = quick
    ? [
        ["lint", "beep:lint"],
        ["check", "beep:check"],
      ]
    : [
        ["lint", "beep:lint"],
        ["check", "beep:check"],
        ["test", "beep:test"],
      ];

  const startMs = Date.now();
  process.stdout.write(`pkg-verify ${pkg.name} (${relative(repoRoot, pkg.dir)})${quick ? " [quick]" : ""}\n`);

  const results = await Promise.all(steps.map(([step, script]) => runStep(step, script, pkg, startMs)));

  const summary = results
    .map((r) => {
      const mark = r.skipped ? "○" : r.ok ? "✔" : "✘";
      const time = r.skipped ? "" : ` ${fmtSecs(r.durationMs)}`;
      return `${mark} ${r.step}${time}`;
    })
    .join("   ");
  process.stdout.write(`  ${summary}\n`);

  const failed = results.filter((r) => !r.ok && !r.skipped);
  for (const f of failed) {
    process.stdout.write(`\n──────── ${f.step} (failed) ────────\n`);
    process.stdout.write(f.output.endsWith("\n") ? f.output : `${f.output}\n`);
  }

  process.exit(failed.length === 0 ? 0 : 1);
};

void main();
