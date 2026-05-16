/**
 * Bun runtime installer configuration layers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $I as $PackagesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { decodeJsonString } from "@beep/schema/Json";
import { Context, Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import { BunRuntimeServerConfig } from "./BunRuntime.config.js";

const $InstallerDependenciesConfigId = $PackagesId.compose(
  "installer-dependencies-config"
).$InstallerDependenciesConfigId;
const $I = $InstallerDependenciesConfigId.create("BunRuntime.layer");

const decodePackageJson = S.decodeUnknownEffect(
  S.Struct({
    packageManager: S.optionalKey(S.String),
  })
);

/**
 * Resolved installer-dependencies configuration value.
 *
 * @category layers
 * @since 0.0.0
 */
export class InstallerDependenciesConfigValue extends S.Class<InstallerDependenciesConfigValue>(
  $I`InstallerDependenciesConfigValue`
)(
  {
    bunRuntime: BunRuntimeServerConfig,
  },
  $I.annote("InstallerDependenciesConfigValue", {
    description: "Resolved installer-dependencies configuration for runtime repair flows.",
  })
) {}

/**
 * Installer-dependencies configuration service contract.
 *
 * @category layers
 * @since 0.0.0
 */
export type InstallerDependenciesConfigShape = InstallerDependenciesConfigValue;

/**
 * Runtime failure while resolving installer-dependencies configuration.
 *
 * @category errors
 * @since 0.0.0
 */
export class InstallerDependenciesConfigResolutionError extends TaggedErrorClass<InstallerDependenciesConfigResolutionError>(
  $I`InstallerDependenciesConfigResolutionError`
)(
  "InstallerDependenciesConfigResolutionError",
  {
    reason: S.NonEmptyString,
  },
  $I.annote("InstallerDependenciesConfigResolutionError", {
    description: "Runtime failure while resolving installer-dependencies configuration.",
  })
) {}

/**
 * Installer-dependencies configuration service.
 *
 * @category layers
 * @since 0.0.0
 */
export class InstallerDependenciesConfig extends Context.Service<
  InstallerDependenciesConfig,
  InstallerDependenciesConfigShape
>()($I`InstallerDependenciesConfig`) {}

const parseRequiredVersionFromRepo = Effect.fn("InstallerDependenciesConfig.parseRequiredVersionFromRepo")(function* (
  repoRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const bunVersionPath = path.join(repoRoot, ".bun-version");
  const packageJsonPath = path.join(repoRoot, "package.json");

  const bunVersion = yield* fs.readFileString(bunVersionPath).pipe(
    Effect.map((content) => content.trim()),
    Effect.catch(() => Effect.succeed(""))
  );

  if (bunVersion.length > 0) {
    return bunVersion;
  }

  const packageJsonContent = yield* fs.readFileString(packageJsonPath).pipe(
    Effect.mapError(
      () =>
        new InstallerDependenciesConfigResolutionError({
          reason: "Unable to read package.json while resolving the required Bun version.",
        })
    )
  );

  const packageJson = yield* decodeJsonString(packageJsonContent).pipe(
    Effect.mapError(
      () =>
        new InstallerDependenciesConfigResolutionError({
          reason: "Unable to parse package.json while resolving the required Bun version.",
        })
    )
  );

  const decoded = yield* decodePackageJson(packageJson).pipe(
    Effect.mapError(
      () =>
        new InstallerDependenciesConfigResolutionError({
          reason: "package.json does not expose a valid Bun packageManager field.",
        })
    )
  );

  const packageManager = decoded.packageManager ?? "";
  const match = /^bun@(.+)$/.exec(packageManager);

  if (match?.[1] !== undefined && match[1].length > 0) {
    return match[1];
  }

  return yield* new InstallerDependenciesConfigResolutionError({
    reason: "Unable to resolve the required Bun version from repo metadata.",
  });
});

const readInstallerDependenciesConfig = Effect.fn("InstallerDependenciesConfig.read")(function* (repoRoot: string) {
  const requiredVersion = yield* parseRequiredVersionFromRepo(repoRoot);

  return new InstallerDependenciesConfigValue({
    bunRuntime: new BunRuntimeServerConfig({ requiredVersion }),
  });
});

/**
 * Build the live installer-dependencies configuration layer from repo metadata.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerDependenciesConfigLayer = (
  repoRoot: string
): Layer.Layer<
  InstallerDependenciesConfig,
  InstallerDependenciesConfigResolutionError,
  FileSystem.FileSystem | Path.Path
> => Layer.effect(InstallerDependenciesConfig, readInstallerDependenciesConfig(repoRoot));

/**
 * Build a deterministic test configuration layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerDependenciesConfigTestLayer = (
  requiredVersion: string
): Layer.Layer<InstallerDependenciesConfig> =>
  Layer.succeed(
    InstallerDependenciesConfig,
    new InstallerDependenciesConfigValue({
      bunRuntime: new BunRuntimeServerConfig({ requiredVersion }),
    })
  );
