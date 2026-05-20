import { fileURLToPath } from "node:url";
import { Str } from "@beep/utils";
import { Effect } from "effect";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../..", import.meta.url));
const joinPath = (base: string, ...segments: ReadonlyArray<string>): string =>
  [Str.replace(/\/+$/u, "")(base), ...segments.map((segment) => Str.replace(/^\/+|\/+$/gu, "")(segment))]
    .filter((segment) => segment.length > 0)
    .join("/");
const catalogPath = joinPath(repoRoot, "standards/repo-exports.catalog.jsonc");
type CatalogExportEntry = {
  readonly exportKind: string;
  readonly importSpecifier: string;
  readonly searchText: string;
  readonly sourcePath: string;
  readonly summary: string;
  readonly symbolName: string;
};
type CatalogPackageEntry = {
  readonly exports: ReadonlyArray<CatalogExportEntry>;
  readonly packageName: string;
};
type RepoExportsCatalog = {
  readonly authority: {
    readonly boundaryDoctrine: ReadonlyArray<string>;
    readonly canonicalStatus: string;
    readonly posture: string;
  };
  readonly packages: ReadonlyArray<CatalogPackageEntry>;
};

const readCatalog = Effect.gen(function* () {
  const errors: Array<jsonc.ParseError> = [];
  const text = yield* Effect.promise(() => Bun.file(catalogPath).text());
  const parsed = jsonc.parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  expect(errors).toEqual([]);
  return parsed as RepoExportsCatalog;
});

describe("repo export catalog", () => {
  it("marks the catalog as descriptive export metadata instead of architecture authority", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const catalog = yield* readCatalog;

        expect(catalog.authority).toEqual(
          expect.objectContaining({
            posture: "descriptive-current-state",
            canonicalStatus: "not-evaluated",
          })
        );
        expect(catalog.authority.boundaryDoctrine).toEqual(
          expect.arrayContaining(["standards/ARCHITECTURE.md", "standards/architecture/README.md"])
        );
      })
    ));

  it("exposes UnknownRecord from the @beep/schema root import", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const catalog = yield* readCatalog;
        const schemaPackage = catalog.packages.find((entry) => entry.packageName === "@beep/schema");

        expect(schemaPackage).toBeDefined();
        if (schemaPackage === undefined) {
          return;
        }

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
      })
    ));
});
