/**
 * Parity harness for migrated CLI checks.
 *
 * For each check being migrated from a `bun run beep ...` ts-morph command to a
 * Biome GritQL rule, this runs BOTH over the current repo tree, normalizes each to a
 * set of `file:line` violation keys, and computes the coverage diff. The Parity Gate
 * (SPEC) accepts a migration only when the old check's violations are a subset of the
 * new rule's (no coverage loss); new-only diagnostics are reported for triage.
 *
 * Local test helper (not package `src`): all side effects are modeled as Effects
 * (`Bun.spawnSync` subprocesses, FileSystem temp dirs, Path normalization), the
 * subprocess JSON is decoded through `effect/Schema`, and the package surface is
 * imported through the `@beep/lint-rules` alias.
 */
import { rulePath } from "@beep/lint-rules";
import { Effect, FileSystem, Path } from "effect";
import * as S from "effect/Schema";
import type { RuleName } from "@beep/lint-rules";

/** Repo root (six levels up from `test/parity`). */
const repoRoot = decodeURIComponent(new URL("../../../../../../", import.meta.url).pathname);

/** A normalized violation key: `<repo-relative-file>:<line>`. */
export type ViolationKey = string;

/**
 * Run a `bun run beep ...` check and parse its `file:line` violations. Works for the
 * tooling-tagged-errors (`file:line:text`) and laws (`file:line:col`) output shapes.
 */
export const oldCliViolations = Effect.fn("parity.oldCliViolations")(function* (args: ReadonlyArray<string>) {
  const path = yield* Path.Path;

  const { exitCode, text } = yield* Effect.sync((): { readonly exitCode: number | null; readonly text: string } => {
    const result = Bun.spawnSync(["bun", "run", "beep", ...args], {
      cwd: repoRoot,
      stdout: "pipe",
      stderr: "pipe",
    });
    return { exitCode: result.exitCode, text: `${result.stdout.toString()}${result.stderr.toString()}` };
  });

  // A normal non-zero exit is expected (the beep CLI returns 1 when it finds
  // violations); only a `null` exitCode means the process never spawned, which would
  // otherwise let an empty output silently false-pass the ∅⊆∅ parity assertion.
  if (exitCode === null) {
    return yield* Effect.die(`parity: \`bun run beep ${args.join(" ")}\` failed to spawn`);
  }

  const keys = new Set<ViolationKey>();
  const re = /^([^\s:]+\.[cm]?tsx?):(\d+)/gm;
  let match: RegExpExecArray | null = re.exec(text);
  while (match !== null) {
    const file = match[1] ?? "";
    const line = match[2] ?? "";
    keys.add(`${path.relative(repoRoot, path.resolve(repoRoot, file))}:${line}`);
    match = re.exec(text);
  }
  return keys as ReadonlySet<ViolationKey>;
});

/** Lenient schema over the subset of Biome's JSON report the parity harness reads. */
const BiomeReport = S.Struct({
  diagnostics: S.Array(
    S.Struct({
      category: S.String.pipe(S.optional),
      location: S.Struct({
        path: S.String.pipe(S.optional),
        start: S.Struct({ line: S.Finite.pipe(S.optional) }).pipe(S.optional),
      }).pipe(S.optional),
    })
  ).pipe(S.optional),
});

const encodeConfig = S.encodeUnknownSync(S.UnknownFromJsonString);
const decodeReport = S.decodeUnknownEffect(S.fromJsonString(BiomeReport));

const emptyReport: S.Schema.Type<typeof BiomeReport> = { diagnostics: undefined };

const parseReport = (stdout: string) => decodeReport(stdout).pipe(Effect.orElseSucceed(() => emptyReport));

/**
 * Run a single GritQL rule over `roots` (repo-relative) and parse its plugin
 * diagnostics into `file:line` keys, mirroring the repo's Biome excludes.
 */
export const newRuleViolations = Effect.fn("parity.newRuleViolations")(function* (
  ruleName: RuleName,
  roots: ReadonlyArray<string>,
  includes?: ReadonlyArray<string>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const config = {
    linter: { enabled: true },
    files: {
      includes: includes ?? [
        "**",
        "!**/dist/**",
        "!**/node_modules/**",
        "!.repos/**",
        "!**/*.gen.*",
        "!**/__snapshots__/**",
      ],
    },
    plugins: [rulePath(ruleName)],
  };

  return yield* Effect.acquireUseRelease(
    fs.makeTempDirectory({ prefix: "beep-parity-" }),
    (tempDir) =>
      Effect.gen(function* () {
        const configPath = path.join(tempDir, "biome.json");
        yield* fs.writeFileString(configPath, `${encodeConfig(config)}\n`);

        const { exitCode, stdout } = yield* Effect.sync(
          (): { readonly exitCode: number | null; readonly stdout: string } => {
            const result = Bun.spawnSync(
              [
                "bunx",
                "biome",
                "lint",
                "--reporter=json",
                "--max-diagnostics=none",
                `--config-path=${configPath}`,
                ...roots,
              ],
              { cwd: repoRoot, stdout: "pipe", stderr: "pipe" }
            );
            return { exitCode: result.exitCode, stdout: result.stdout.toString() };
          }
        );

        // Biome exits 0 (warn) or 1 (error) for findings — both expected. Only a `null`
        // exitCode means biome never spawned, which would let empty output silently
        // false-pass the ∅⊆∅ parity assertion.
        if (exitCode === null) {
          return yield* Effect.die(`parity: \`bunx biome lint ${roots.join(" ")}\` failed to spawn`);
        }

        const keys = new Set<ViolationKey>();
        const report = yield* parseReport(stdout);
        for (const d of report.diagnostics ?? []) {
          if (d.category !== "plugin") continue;
          const file = d.location?.path;
          const line = d.location?.start?.line;
          if (file !== undefined && line !== undefined) {
            keys.add(`${path.relative(repoRoot, path.resolve(repoRoot, file))}:${line}`);
          }
        }
        return keys as ReadonlySet<ViolationKey>;
      }),
    (tempDir) => fs.remove(tempDir, { recursive: true, force: true }).pipe(Effect.ignore)
  );
});

/** Coverage diff: `missing` = old\new (coverage loss, must be empty); `extra` = new\old. */
export const coverageDiff = (
  oldKeys: ReadonlySet<ViolationKey>,
  newKeys: ReadonlySet<ViolationKey>
): { readonly missing: ReadonlyArray<ViolationKey>; readonly extra: ReadonlyArray<ViolationKey> } => ({
  missing: [...oldKeys].filter((k) => !newKeys.has(k)).sort(),
  extra: [...newKeys].filter((k) => !oldKeys.has(k)).sort(),
});
