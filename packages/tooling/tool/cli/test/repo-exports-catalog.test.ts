import { fileURLToPath } from "node:url";
import { readRepoExportsCatalog } from "@beep/repo-codegraph";
import { provideScopedLayer } from "@beep/test-utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../..", import.meta.url));
const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

const readCatalog = readRepoExportsCatalog(repoRoot).pipe(provideScopedLayer(PlatformLayer));

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
              sourcePath: "packages/foundation/modeling/schema/src/Record/Record.schema.ts",
              summary: "Schema for object records with string keys and unknown values.",
            }),
          ])
        );
        expect(unknownRecordEntries.map((entry) => entry.searchText).join("\n")).toContain("unknown values");
      })
    ));
});
