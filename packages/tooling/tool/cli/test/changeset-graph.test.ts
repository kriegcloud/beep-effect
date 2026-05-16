import {
  ChangesetGraphPackageReference,
  changesetPackageReferencesFromText,
  findMissingChangesetPackageReferences,
  makeChangesetGraphSummary,
} from "@beep/repo-cli/commands/Quality/ChangesetGraph";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("changeset graph", () => {
  it.effect("parses package names from changeset frontmatter", () =>
    Effect.gen(function* () {
      const references = yield* changesetPackageReferencesFromText(
        ".changeset/demo.md",
        `---
"@beep/schema": patch
"@beep/repo-cli": minor
---

Patch package metadata.
`
      );

      expect(references).toEqual([
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/repo-cli",
        }),
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/schema",
        }),
      ]);
    })
  );

  it.effect("treats empty changeset frontmatter as a valid no-op", () =>
    Effect.gen(function* () {
      const references = yield* changesetPackageReferencesFromText(
        ".changeset/noop.md",
        `---
---

Record a private workspace change.
`
      );

      expect(references).toEqual([]);
    })
  );

  it("reports only package references outside the workspace graph", () => {
    const missing = findMissingChangesetPackageReferences(
      ["@beep/schema"],
      [
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/schema",
        }),
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/missing",
        }),
      ]
    );

    expect(missing).toEqual([
      new ChangesetGraphPackageReference({
        file: ".changeset/demo.md",
        packageName: "@beep/missing",
      }),
    ]);
  });

  it("builds a stable summary for release preflight output", () => {
    const summary = makeChangesetGraphSummary(
      ["@beep/schema"],
      [".changeset/demo.md"],
      [
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/missing",
        }),
      ]
    );

    expect(summary).toMatchObject({
      workspacePackages: 1,
      changesetFiles: 1,
      references: 1,
      missingReferences: [
        new ChangesetGraphPackageReference({
          file: ".changeset/demo.md",
          packageName: "@beep/missing",
        }),
      ],
    });
  });
});
