import { BunVersionState, buildBunReport } from "@beep/repo-cli/commands/VersionSync/internal/resolvers/BunResolver";
import {
  buildEffectReport,
  resolveEffectCatalog,
} from "@beep/repo-cli/commands/VersionSync/internal/resolvers/EffectResolver";
import { updateCatalogEntry } from "@beep/repo-cli/commands/VersionSync/internal/updaters/PackageJsonUpdater";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

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
          `${encodeJson({
            name: "@beep/test-root",
            catalog: {
              effect: "^4.0.0-beta.28",
              "@effect/opentelemetry": "^4.0.0-beta.27",
              "@effect/platform-bun": "^4.0.0-beta.28",
              "@effect/vitest": "^4.0.0-beta.26",
              "@effect/language-service": "^0.78.0",
              "@effect/docgen": "https://pkg.pr.new/Effect-TS/docgen/@effect/docgen@e7fe055",
            },
          })}\n`
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
          `${encodeJson({
            name: "@beep/test-root",
            catalog: {
              effect: "^4.0.0-beta.28",
              "@effect/opentelemetry": "^4.0.0-beta.27",
            },
          })}\n`
        );

        const changed = yield* updateCatalogEntry(packageJsonPath, "@effect/opentelemetry", "^4.0.0-beta.28");
        const updated = yield* fs.readFileString(packageJsonPath);
        const decodedUpdated = S.decodeUnknownSync(S.UnknownFromJsonString)(updated) as {
          readonly catalog: Record<string, string>;
        };

        expect(changed).toBe(true);
        expect(decodedUpdated.catalog["@effect/opentelemetry"]).toBe("^4.0.0-beta.28");
        expect(decodedUpdated.catalog.effect).toBe("^4.0.0-beta.28");

        yield* fs.remove(tmpDir, { recursive: true });
      })
    );
  });

  describe("buildBunReport", () => {
    it("uses semver precedence instead of lexicographic string ordering for local Bun pins", () => {
      const report = buildBunReport(
        new BunVersionState({
          bunVersionFile: "1.10.0",
          packageManagerField: "1.9.0",
          latest: O.none(),
        })
      );

      expect(report.status).toBe("drift");
      expect(report.items).toHaveLength(1);
      expect(report.items[0]?.file).toBe("package.json");
      expect(report.items[0]?.expected).toBe("bun@1.10.0");
    });

    it("treats stable releases as newer than prereleases with the same core version", () => {
      const report = buildBunReport(
        new BunVersionState({
          bunVersionFile: "1.10.0-beta.1",
          packageManagerField: "1.10.0",
          latest: O.none(),
        })
      );

      expect(report.status).toBe("drift");
      expect(report.items).toHaveLength(1);
      expect(report.items[0]?.file).toBe(".bun-version");
      expect(report.items[0]?.expected).toBe("1.10.0");
    });
  });
});
