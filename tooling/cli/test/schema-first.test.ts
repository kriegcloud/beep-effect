import {
  createFileGenerationPlanService,
  FileGenerationPlanInput,
  GenerationAction,
  PlannedFile,
  PlannedSymlink,
} from "@beep/repo-cli/commands/CreatePackage/FileGenerationPlanService";
import { VersionSyncOptions } from "@beep/repo-cli/commands/VersionSync/internal/Models";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

describe("tooling/cli schema-first models", () => {
  it("applies decoding defaults for FileGenerationPlanInput.symlinks", () => {
    const decoded = S.decodeUnknownSync(FileGenerationPlanInput)({
      outputDir: "/tmp/demo",
      directories: ["src"],
      files: [{ relativePath: "src/index.ts", content: "export {};\n" }],
    });

    expect(decoded.symlinks).toEqual([]);
  });

  it("uses tagged-union helpers for GenerationAction", () => {
    const action = new GenerationAction.cases["write-file"]({
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
      new FileGenerationPlanInput({
        outputDir: "/tmp/demo",
        directories: ["src", "docs", "src"],
        files: [
          new PlannedFile({ relativePath: "src/index.ts", content: "export {};\n" }),
          new PlannedFile({ relativePath: "docs/index.md", content: "# docs\n" }),
        ],
        symlinks: [new PlannedSymlink({ relativePath: "CLAUDE.md", target: "AGENTS.md" })],
      })
    );

    const preview = service.previewPlan(plan);

    expect(preview).toContain("write docs/index.md");
    expect(preview).toContain("write src/index.ts");
    expect(preview).toContain("symlink CLAUDE.md -> AGENTS.md");
  });

  it("exposes toTaggedUnion helpers for VersionSyncOptions", () => {
    const option = new VersionSyncOptions.cases["dry-run"]({
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
});
