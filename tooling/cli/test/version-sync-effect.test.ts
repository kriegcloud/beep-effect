import { NodeServices } from "@effect/platform-node";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import * as O from "effect/Option";
import {
  buildEffectReport,
  resolveEffectCatalog,
} from "../src/commands/VersionSync/internal/resolvers/EffectResolver.js";
import { updateCatalogEntry } from "../src/commands/VersionSync/internal/updaters/PackageJsonUpdater.js";

layer(NodeServices.layer)("VersionSync Effect Catalog", (it) => {
  describe("resolveEffectCatalog", () => {
    it.effect(
      "detects drift for lockstep Effect packages while ignoring non-lockstep Effect tools",
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = yield* fs.makeTempDirectory();
        const packageJsonPath = path.join(tmpDir, "package.json");

        yield* fs.writeFileString(
          packageJsonPath,
          `${JSON.stringify(
            {
              name: "@beep/test-root",
              catalog: {
                effect: "^4.0.0-beta.28",
                "@effect/opentelemetry": "^4.0.0-beta.27",
                "@effect/platform-bun": "^4.0.0-beta.28",
                "@effect/vitest": "^4.0.0-beta.26",
                "@effect/language-service": "^0.78.0",
                "@effect/docgen": "https://pkg.pr.new/Effect-TS/docgen/@effect/docgen@e7fe055",
              },
            },
            null,
            2
          )}\n`
        );

        const state = yield* resolveEffectCatalog(tmpDir);
        const report = buildEffectReport(state);

        expect(report.status).toBe("drift");
        expect(O.isSome(report.latest)).toBe(true);
        if (O.isSome(report.latest)) {
          expect(report.latest.value).toBe("^4.0.0-beta.28");
        }
        expect(report.items).toHaveLength(2);
        expect(report.items.map((item) => item.field)).toEqual([
          "catalog.@effect/opentelemetry",
          "catalog.@effect/vitest",
        ]);
        expect(report.items.map((item) => item.expected)).toEqual(["^4.0.0-beta.28", "^4.0.0-beta.28"]);

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );
  });

  describe("updateCatalogEntry", () => {
    it.effect(
      "rewrites a root package.json catalog entry in place",
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = yield* fs.makeTempDirectory();
        const packageJsonPath = path.join(tmpDir, "package.json");

        yield* fs.writeFileString(
          packageJsonPath,
          `${JSON.stringify(
            {
              name: "@beep/test-root",
              catalog: {
                effect: "^4.0.0-beta.28",
                "@effect/opentelemetry": "^4.0.0-beta.27",
              },
            },
            null,
            2
          )}\n`
        );

        const changed = yield* updateCatalogEntry(packageJsonPath, "@effect/opentelemetry", "^4.0.0-beta.28");
        const updated = yield* fs.readFileString(packageJsonPath);

        expect(changed).toBe(true);
        expect(updated).toContain('"@effect/opentelemetry": "^4.0.0-beta.28"');
        expect(updated).toContain('"effect": "^4.0.0-beta.28"');

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );
  });
});
