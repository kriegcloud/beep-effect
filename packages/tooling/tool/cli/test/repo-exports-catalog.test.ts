import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../..", import.meta.url));
const catalogPath = join(repoRoot, "standards/repo-exports.catalog.jsonc");

const readCatalog = () => {
  const errors: Array<jsonc.ParseError> = [];
  const parsed = jsonc.parse(readFileSync(catalogPath, "utf8"), errors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  expect(errors).toEqual([]);
  return parsed;
};

describe("repo export catalog", () => {
  it("marks the catalog as descriptive export metadata instead of architecture authority", () => {
    const catalog = readCatalog();

    expect(catalog.authority).toEqual(
      expect.objectContaining({
        posture: "descriptive-current-state",
        canonicalStatus: "not-evaluated",
      })
    );
    expect(catalog.authority.boundaryDoctrine).toEqual(
      expect.arrayContaining(["standards/ARCHITECTURE.md", "standards/architecture/README.md"])
    );
  });

  it("exposes UnknownRecord from the @beep/schema root import", () => {
    const catalog = readCatalog();
    const schemaPackage = catalog.packages.find((entry) => entry.packageName === "@beep/schema");

    expect(schemaPackage).toBeDefined();

    const unknownRecordEntries = schemaPackage.exports.filter(
      (entry) => entry.importSpecifier === "@beep/schema" && entry.symbolName === "UnknownRecord"
    );

    expect(unknownRecordEntries.map((entry) => entry.exportKind).sort()).toEqual(["const", "type"]);
    expect(unknownRecordEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourcePath: "packages/foundation/modeling/schema/src/Record.ts",
          summary: "Schema for object records with string keys and unknown values.",
        }),
      ])
    );
    expect(unknownRecordEntries.map((entry) => entry.searchText).join("\n")).toContain("unknown values");
  });
});
