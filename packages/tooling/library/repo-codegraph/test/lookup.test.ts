import {
  lookupRepoExports,
  RepoCodegraphLookupRequest,
  RepoExportsCatalog,
  RepoExportsCatalogAuthority,
  RepoExportsCatalogEntry,
  RepoExportsCatalogPackage,
  RepoExportsCatalogPackageCounts,
  RepoExportsCatalogSource,
  RepoExportsCatalogTotals,
} from "@beep/repo-codegraph";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";

const unknownRecordEntry = new RepoExportsCatalogEntry({
  categories: ["schemas"],
  exportKind: "const",
  exportSubpath: ".",
  exportedFromPath: "packages/foundation/modeling/schema/src/index.ts",
  importSpecifier: "@beep/schema",
  packageName: "@beep/schema",
  packagePath: "packages/foundation/modeling/schema",
  searchText:
    "@beep/schema packages/foundation/modeling/schema @beep/schema . unknownrecord const schema for object records with string keys and unknown values. schemas packages/foundation/modeling/schema/src/record.ts",
  since: ["0.0.0"],
  sourceLine: 29,
  sourcePath: "packages/foundation/modeling/schema/src/Record.ts",
  summary: "Schema for object records with string keys and unknown values.",
  symbolName: "UnknownRecord",
  tags: ["@example", "@category", "@since"],
  topoOrder: 6,
});

const unknownRecordSubpathEntry = new RepoExportsCatalogEntry({
  ...unknownRecordEntry,
  exportSubpath: "./Record",
  exportedFromPath: "packages/foundation/modeling/schema/src/Record.ts",
  importSpecifier: "@beep/schema/Record",
});

const reusePacketEntry = new RepoExportsCatalogEntry({
  categories: ["models"],
  exportKind: "class",
  exportSubpath: ".",
  exportedFromPath: "packages/tooling/library/repo-utils/src/index.ts",
  importSpecifier: "@beep/repo-utils",
  packageName: "@beep/repo-utils",
  packagePath: "packages/tooling/library/repo-utils",
  searchText: "@beep/repo-utils reusepacket class materialized reuse candidate implementation packet.",
  since: ["0.0.0"],
  sourceLine: 150,
  sourcePath: "packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts",
  summary: "Materialized reuse candidate implementation packet.",
  symbolName: "ReusePacket",
  tags: ["@example", "@category", "@since"],
  topoOrder: 20,
});

const catalog = new RepoExportsCatalog({
  authority: new RepoExportsCatalogAuthority({
    boundaryDoctrine: ["standards/ARCHITECTURE.md"],
    canonicalStatus: "not-evaluated",
    note: "Fixture catalog.",
    posture: "descriptive-current-state",
  }),
  deterministic: true,
  packages: [
    new RepoExportsCatalogPackage({
      counts: new RepoExportsCatalogPackageCounts({
        publicExportEntries: 2,
        sourceFiles: 1,
        uniqueSymbols: 1,
      }),
      exports: [unknownRecordEntry, unknownRecordSubpathEntry],
      importSpecifiers: ["@beep/schema", "@beep/schema/Record"],
      packageName: "@beep/schema",
      packagePath: "packages/foundation/modeling/schema",
      status: "has-public-exports",
      topoOrder: 6,
    }),
    new RepoExportsCatalogPackage({
      counts: new RepoExportsCatalogPackageCounts({
        publicExportEntries: 1,
        sourceFiles: 1,
        uniqueSymbols: 1,
      }),
      exports: [reusePacketEntry],
      importSpecifiers: ["@beep/repo-utils"],
      packageName: "@beep/repo-utils",
      packagePath: "packages/tooling/library/repo-utils",
      status: "has-public-exports",
      topoOrder: 20,
    }),
  ],
  schemaVersion: "repo-exports-catalog/v1",
  source: new RepoExportsCatalogSource({
    generator: "fixture",
    inputs: ["fixture"],
    packageUniverseCommand: "fixture",
  }),
  standard: "repo-exports-catalog",
  totals: new RepoExportsCatalogTotals({
    importSpecifiers: 3,
    missingWorkspaceMetadata: 0,
    packages: 2,
    packagesWithPublicExports: 2,
    packagesWithoutPublicExports: 0,
    publicExportEntries: 3,
    uniquePackageSymbols: 2,
  }),
});

describe("lookupRepoExports", () => {
  it("finds existing public exports by exact symbol name", () => {
    const result = lookupRepoExports(
      catalog,
      new RepoCodegraphLookupRequest({
        fromPackage: O.some("packages/tooling/tool/cli"),
        limit: 8,
        query: "UnknownRecord",
      }),
      { freshnessStatus: "current", importPolicies: [] }
    );

    expect(result.freshnessStatus).toBe("current");
    expect(result.warnings).toEqual([]);
    expect(
      A.some(result.matches, (match) => match.packageName === "@beep/schema" && match.symbolName === "UnknownRecord")
    ).toBe(true);
    expect(result.matches[0]?.recommendedImport.importSpecifier).toBe("@beep/schema");
  });

  it("finds existing public exports by descriptive intent", () => {
    const result = lookupRepoExports(
      catalog,
      new RepoCodegraphLookupRequest({
        fromPackage: O.none(),
        limit: 8,
        query: "object records with string keys",
      })
    );

    expect(result.freshnessStatus).toBe("unchecked");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(
      A.some(result.matches, (match) => match.packageName === "@beep/schema" && match.symbolName === "UnknownRecord")
    ).toBe(true);
  });
});
