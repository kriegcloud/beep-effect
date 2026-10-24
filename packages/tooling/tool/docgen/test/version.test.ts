import * as Version from "@beep/repo-docgen/Version";
import { it } from "@beep/test-runner";
import { Str } from "@beep/utils";
import * as BunServices from "@effect/platform-bun/BunServices";
import { expect } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as PlatformError from "effect/PlatformError";
import * as S from "effect/Schema";

const decodeManifestVersion = S.decodeUnknownEffect(S.fromJsonString(S.Struct({ version: S.String })));

it.layer(BunServices.layer)("Version", (it) => {
  it.effect("reads the docgen package version from its manifest", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const manifest = yield* decodeManifestVersion(yield* fs.readFileString("package.json"));
      const version = yield* Version.readModuleVersion();
      expect(version).toBe(manifest.version);
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    })
  );
});

// No file system entry exists, so the manifest read fails and maps to a
// `DocgenError` naming the manifest.
it.layer(Layer.mergeAll(Path.layer, FileSystem.layerNoop({})))("Version without a manifest", (it) => {
  it.effect("fails with a DocgenError when the manifest cannot be read", () =>
    Effect.gen(function* () {
      const error = yield* Version.readModuleVersion().pipe(Effect.flip);
      assertTrue(Str.includes("[Version.readModuleVersion] Failed to read")(error.message));
    })
  );
});

const rejectedManifestUrl = Effect.fail(
  new PlatformError.BadArgument({ module: "VersionTest", method: "fromFileUrl" })
);

const rejectingPath = Layer.effect(
  Path.Path,
  Effect.gen(function* () {
    const path = yield* Path.Path;
    return {
      ...path,
      fromFileUrl: Effect.fn("VersionTest.fromFileUrl")(function* () {
        return yield* rejectedManifestUrl;
      }),
    };
  })
).pipe(Layer.provide(Path.layer));

it.layer(Layer.mergeAll(rejectingPath, FileSystem.layerNoop({})))("Version with a rejected manifest URL", (it) => {
  it.effect("fails with a DocgenError when the manifest URL does not resolve", () =>
    Effect.gen(function* () {
      const error = yield* Version.readModuleVersion().pipe(Effect.flip);
      assertTrue(Str.includes("[Version.readModuleVersion] Failed to resolve manifest path")(error.message));
    })
  );
});
