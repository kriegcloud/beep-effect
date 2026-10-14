import { it } from "@beep/test-runner";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { jsonReportParser, validateLinterProcess } from "./codec.ts";

const repoRoot = decodeURIComponent(new URL("../../../../../", import.meta.url).pathname);
const canary = "scratchpad/effected/.canary/LawsCanary.ts";
const admitted = ["src/Ordinary.ts", "scratchpad/effected/example/Ordinary.ts", canary];
const ignored = [
  "scratchpad/effected/example/dist/Output.ts",
  "scratchpad/effected/example/build/Output.ts",
  "scratchpad/effected/example/.next/Output.ts",
  "scratchpad/effected/example/.turbo/Output.ts",
  "scratchpad/effected/example/coverage/Output.ts",
  "scratchpad/effected/example/generated/Output.ts",
  "scratchpad/effected/example/Output.gen.ts",
  "src/dist/Output.ts",
  "src/build/Output.ts",
  "src/.turbo/Output.ts",
  "src/generated/Output.ts",
  "src/Output.gen.ts",
  "docs/generated/Output.ts",
  ".repos/Output.ts",
  ".codex/Output.ts",
  ".claude/Output.ts",
  "src/scripts/Output.ts",
  "goals/Output.ts",
  "explorations/Output.ts",
];

// Only the CLI fields asserted below cross this test boundary.
const Report = S.Struct({ diagnostics: S.Array(S.Struct({ filename: S.String, code: S.String })) });
const parseReport = jsonReportParser(Report);
const fixtureSource =
  'import * as S from "effect/Schema";\nexport const check = (value: unknown) => S.is(S.Array(S.String))(value);\n';

const run = Effect.fn("effectedProfile.run")(function* (cwd: string, config: string, targets: ReadonlyArray<string>) {
  const result = yield* Effect.sync(() =>
    Bun.spawnSync(
      [
        `${repoRoot}/node_modules/.bin/oxlint`,
        "--quiet",
        "--disable-nested-config",
        "--format=json",
        "--config",
        config,
        ...targets,
      ],
      { cwd, stdout: "pipe", stderr: "pipe" }
    )
  );
  yield* validateLinterProcess(result);
  const report = yield* parseReport(result.stdout.toString());
  return { exitCode: result.exitCode, diagnostics: report.diagnostics };
});

const withFixture = Effect.fn("effectedProfile.withFixture")(function* <Success, Error, Requirements>(
  use: (root: string) => Effect.Effect<Success, Error, Requirements>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return yield* Effect.acquireUseRelease(
    fs.makeTempDirectory({ directory: repoRoot, prefix: ".effected-profile-" }),
    Effect.fnUntraced(function* (root) {
      const config = yield* fs.readFileString(path.join(repoRoot, ".oxlintrc.json"));
      yield* fs.writeFileString(
        path.join(root, ".oxlintrc.json"),
        Str.replace(
          "./packages/tooling/policy-pack/lint-rules/src/rules/index.ts",
          `${repoRoot}/packages/tooling/policy-pack/lint-rules/src/rules/index.ts`
        )(config)
      );
      yield* fs.copyFile(path.join(repoRoot, ".oxlintrc.effected.json"), path.join(root, ".oxlintrc.effected.json"));
      yield* Effect.forEach(
        [...admitted, ...ignored],
        Effect.fnUntraced(function* (file) {
          const target = path.join(root, file);
          yield* fs.makeDirectory(path.dirname(target), { recursive: true });
          yield* fs.writeFileString(target, fixtureSource);
        })
      );
      return yield* use(root);
    }),
    (root) => fs.remove(root, { recursive: true, force: true })
  );
});

describe("Effected oxlint profile", () => {
  it.layer(NodeServices.layer)((it) =>
    it.effect("preserves root exclusions while admitting ordinary source and the explicit canary", () =>
      withFixture(
        Effect.fnUntraced(function* (root) {
          const result = yield* run(root, ".oxlintrc.effected.json", [
            "src",
            "scratchpad/effected/example",
            canary,
            "docs",
            ".repos",
            ".codex",
            ".claude",
            "goals",
            "explorations",
          ]);
          expect(result.exitCode).toBe(1);
          expect(A.map(result.diagnostics, (diagnostic) => diagnostic.code)).toEqual(
            A.replicate("beep(no-inline-schema-compile)", admitted.length)
          );
          expect(
            A.sort(
              A.map(result.diagnostics, (diagnostic) => diagnostic.filename),
              Order.String
            )
          ).toEqual(A.sort(admitted, Order.String));
        })
      )
    )
  );

  it.effect("independently rejects the repository law canary with inherited plugin rules", () =>
    Effect.gen(function* () {
      const result = yield* run(repoRoot, ".oxlintrc.effected.json", [canary]);
      expect(result.exitCode).toBe(1);
      expect(result.diagnostics).toContainEqual({ filename: canary, code: "beep(no-inline-schema-compile)" });
    })
  );
});
