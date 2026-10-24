/**
 * Internal package version metadata for the docgen CLI.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { PackageJsonFile } from "@beep/package-json/PackageJsonFile";
import * as Effect from "effect/Effect";
import * as Path from "effect/Path";
import * as Domain from "./Domain.ts";
import type * as FileSystem from "effect/FileSystem";

/**
 * Reads the runtime package version shown in the CLI banner and proof manifests.
 *
 * **Example** (Log package version)
 *
 * ```ts
 * import { BunServices } from "@effect/platform-bun"
 * import * as Effect from "effect/Effect";
 * import { readModuleVersion } from "../../src/Version.ts"
 *
 * const version = await Effect.runPromise(
 *   readModuleVersion().pipe(Effect.provide(BunServices.layer))
 * )
 * console.log(version)
 * ```
 *
 * @internal
 * @category configuration
 * @since 0.0.0
 */
export const readModuleVersion = Effect.fn("Version.readModuleVersion")(function* (): Effect.fn.Return<
  string,
  Domain.DocgenError,
  FileSystem.FileSystem | Path.Path
> {
  const path = yield* Path.Path;
  const manifestUrl = new URL("../package.json", import.meta.url);
  const manifestPath = yield* path.fromFileUrl(manifestUrl).pipe(
    Effect.mapError((cause) =>
      Domain.DocgenError.make({
        message: `[Version.readModuleVersion] Failed to resolve manifest path '${manifestUrl.href}'\n${String(cause)}`,
      })
    )
  );
  const files = yield* PackageJsonFile.make;
  const manifest = yield* files.read(manifestPath).pipe(
    Effect.mapError((cause) =>
      Domain.DocgenError.make({
        message: `[Version.readModuleVersion] Failed to read '${manifestPath}'\n${String(cause)}`,
      })
    )
  );

  return manifest.version.toString();
});
