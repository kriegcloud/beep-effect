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
import { pipe } from "effect";
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

const sharedDomainEntry = new RepoExportsCatalogEntry({
  categories: ["models"],
  exportKind: "class",
  exportSubpath: ".",
  exportedFromPath: "packages/shared/domain/src/index.ts",
  importSpecifier: "@beep/shared-domain",
  packageName: "@beep/shared-domain",
  packagePath: "packages/shared/domain",
  searchText: "@beep/shared-domain packages/shared/domain @beep/shared-domain . sharedentity class shared entity.",
  since: ["0.0.0"],
  sourceLine: 10,
  sourcePath: "packages/shared/domain/src/entities/SharedEntity.ts",
  summary: "Shared entity.",
  symbolName: "SharedEntity",
  tags: ["@example", "@category", "@since"],
  topoOrder: 10,
});

const driverEntry = new RepoExportsCatalogEntry({
  categories: ["services"],
  exportKind: "class",
  exportSubpath: ".",
  exportedFromPath: "packages/drivers/example/src/index.ts",
  importSpecifier: "@beep/example-driver",
  packageName: "@beep/example-driver",
  packagePath: "packages/drivers/example",
  searchText:
    "@beep/example-driver packages/drivers/example @beep/example-driver . driveradapter class external service adapter.",
  since: ["0.0.0"],
  sourceLine: 12,
  sourcePath: "packages/drivers/example/src/DriverAdapter.ts",
  summary: "External service adapter.",
  symbolName: "DriverAdapter",
  tags: ["@example", "@category", "@since"],
  topoOrder: 30,
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
    new RepoExportsCatalogPackage({
      counts: new RepoExportsCatalogPackageCounts({
        publicExportEntries: 1,
        sourceFiles: 1,
        uniqueSymbols: 1,
      }),
      exports: [sharedDomainEntry],
      importSpecifiers: ["@beep/shared-domain"],
      packageName: "@beep/shared-domain",
      packagePath: "packages/shared/domain",
      status: "has-public-exports",
      topoOrder: 10,
    }),
    new RepoExportsCatalogPackage({
      counts: new RepoExportsCatalogPackageCounts({
        publicExportEntries: 1,
        sourceFiles: 1,
        uniqueSymbols: 1,
      }),
      exports: [driverEntry],
      importSpecifiers: ["@beep/example-driver"],
      packageName: "@beep/example-driver",
      packagePath: "packages/drivers/example",
      status: "has-public-exports",
      topoOrder: 30,
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
    packages: 4,
    packagesWithPublicExports: 4,
    packagesWithoutPublicExports: 0,
    publicExportEntries: 5,
    uniquePackageSymbols: 4,
  }),
});

describe("lookupRepoExports", () => {
  it("finds existing public exports by exact symbol name", () => {
    const result = lookupRepoExports(
      catalog,
      new RepoCodegraphLookupRequest({
        fromPackage: O.some("packages/tooling/library/repo-utils"),
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

  it("blocks shared domain lookups that would depend on driver packages", () => {
    const result = lookupRepoExports(
      catalog,
      new RepoCodegraphLookupRequest({
        fromPackage: O.some("packages/shared/domain"),
        limit: 8,
        query: "DriverAdapter",
      }),
      { freshnessStatus: "current", importPolicies: [] }
    );

    const driverMatch = A.findFirst(result.matches, (match) => match.symbolName === "DriverAdapter");

    expect(O.isSome(driverMatch)).toBe(true);
    if (O.isSome(driverMatch)) {
      expect(driverMatch.value.boundary.status).toBe("blocked");
    }
  });

  it("warns when a caller package selector does not match the catalog", () => {
    const result = lookupRepoExports(
      catalog,
      new RepoCodegraphLookupRequest({
        fromPackage: O.some("packages/missing/domain"),
        limit: 8,
        query: "UnknownRecord",
      }),
      { freshnessStatus: "current", importPolicies: [] }
    );

    expect(result.warnings).toEqual([
      'Caller package selector "packages/missing/domain" did not match any catalog package.',
    ]);
    expect(result.matches[0]?.boundary.status).toBe("unknown");
    expect(result.matches[0]?.boundary.reason).toBe(
      'Caller package selector "packages/missing/domain" did not match any catalog package.'
    );
  });

  it("supports data-last lookup composition", () => {
    const result = pipe(
      catalog,
      lookupRepoExports(
        new RepoCodegraphLookupRequest({
          fromPackage: O.some("packages/tooling/library/repo-utils"),
          limit: 8,
          query: "UnknownRecord",
        }),
        { freshnessStatus: "current", importPolicies: [] }
      )
    );

    expect(result.matches[0]?.symbolName).toBe("UnknownRecord");
  });
});
