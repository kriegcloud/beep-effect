import { sourceTextHasSchemaArbitraryPropertyCoverage } from "@beep/repo-cli/commands/Lint";
import {
  createFileGenerationPlanService,
  FileGenerationPlanInput,
  GenerationAction,
  PlannedFile,
  PlannedSymlink,
} from "@beep/repo-cli/test/CreatePackage";
import { VersionSyncOptions } from "@beep/repo-cli/test/VersionSync";
import { isExcludedTypeScriptSourcePath } from "@beep/repo-utils/schemas/TypeScriptSourceExclusions";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

describe("packages/tooling/tool/cli schema-first models", () => {
  it("applies decoding defaults for FileGenerationPlanInput.symlinks", () => {
    const decoded = S.decodeUnknownSync(FileGenerationPlanInput)({
      outputDir: "/tmp/demo",
      directories: ["src"],
      files: [{ relativePath: "src/index.ts", content: "export {};\n" }],
    });

    expect(decoded.symlinks).toEqual([]);
  });

  it("uses tagged-union helpers for GenerationAction", () => {
    const action = GenerationAction.cases["write-file"].make({
      relativePath: "src/index.ts",
      content: "export const x = 1;\n",
    });

    const summary = GenerationAction.match(action, {
      mkdir: ({ relativePath }) => `mkdir:${relativePath}`,
      "write-file": ({ relativePath }) => `write:${relativePath}`,
      symlink: ({ relativePath, target }) => `symlink:${relativePath}->${target}`,
    });

    expect(summary).toBe("write:src/index.ts");
  });

  it("creates deterministic plans via schema-backed input", () => {
    const service = createFileGenerationPlanService();
    const plan = service.createPlan(
      FileGenerationPlanInput.make({
        outputDir: "/tmp/demo",
        directories: ["src", "docs", "src"],
        files: [
          PlannedFile.make({ relativePath: "src/index.ts", content: "export {};\n" }),
          PlannedFile.make({ relativePath: "docs/index.md", content: "# docs\n" }),
        ],
        symlinks: [PlannedSymlink.make({ relativePath: "CLAUDE.md", target: "AGENTS.md" })],
      })
    );

    const preview = service.previewPlan(plan);

    expect(preview).toContain("write docs/index.md");
    expect(preview).toContain("write src/index.ts");
    expect(preview).toContain("symlink CLAUDE.md -> AGENTS.md");
  });

  it("exposes toTaggedUnion helpers for VersionSyncOptions", () => {
    const option = VersionSyncOptions.cases["dry-run"].make({
      skipNetwork: true,
      bunOnly: false,
      nodeOnly: false,
      dockerOnly: false,
      biomeOnly: false,
      effectOnly: false,
    });

    const modeLabel = VersionSyncOptions.match(option, {
      check: () => "check",
      write: () => "write",
      "dry-run": () => "dry-run",
    });

    expect(modeLabel).toBe("dry-run");
  });

  it("excludes generated docs examples from source-law scans", () => {
    expect(
      isExcludedTypeScriptSourcePath("packages/foundation/modeling/schema/docs/examples/src-Yaml.ts-example.ts")
    ).toBe(true);
    expect(isExcludedTypeScriptSourcePath("packages/foundation/modeling/schema/src/Yaml.ts")).toBe(false);
  });

  it("recognizes repo-owned schema arbitrary helpers as schema-derived property coverage", () => {
    expect(
      sourceTextHasSchemaArbitraryPropertyCoverage(
        [
          'import * as S from "effect/Schema";',
          'import { assertSchemaArbitraryDecodesToSelf } from "@beep/test-utils";',
          "const Worker = S.Struct({ id: S.String, retryCount: S.Int });",
          "assertSchemaArbitraryDecodesToSelf(Worker);",
        ].join("\n")
      )
    ).toBe(true);
    expect(
      sourceTextHasSchemaArbitraryPropertyCoverage("fc.property(fc.string(), (value) => value.length >= 0);")
    ).toBe(false);
    expect(
      sourceTextHasSchemaArbitraryPropertyCoverage(
        [
          'import * as fc from "fast-check";',
          'import * as S from "effect/Schema";',
          "const Worker = S.Struct({ id: S.String });",
          "const WorkerArbitrary = S.toArbitraryLazy(Worker);",
          "fc.property(WorkerArbitrary, (worker) => typeof worker.id === 'string');",
        ].join("\n")
      )
    ).toBe(true);
    expect(
      sourceTextHasSchemaArbitraryPropertyCoverage(
        [
          'import * as fc from "fast-check";',
          'import * as S from "effect/Schema";',
          "const Worker = S.Struct({ id: S.String });",
          "const WorkerArbitrary = S.toArbitrary(Worker);",
          "fc.property(fc.array(WorkerArbitrary), (workers) => workers.every((worker) => typeof worker.id === 'string'));",
        ].join("\n")
      )
    ).toBe(true);
    expect(sourceTextHasSchemaArbitraryPropertyCoverage("const WorkerArbitrary = S.toArbitraryLazy(Worker);")).toBe(
      false
    );
    expect(
      sourceTextHasSchemaArbitraryPropertyCoverage(
        'import { assertSchemaArbitraryDecodesToSelf } from "@beep/test-utils";'
      )
    ).toBe(false);
  });
});
