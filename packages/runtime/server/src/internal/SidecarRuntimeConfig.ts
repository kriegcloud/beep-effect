/**
 * Environment and filesystem configuration helpers for the sidecar runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RuntimeServerId } from "@beep/identity/packages";
import { Config, Effect, FileSystem, flow, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RuntimeServerId.create("internal/SidecarRuntimeConfig");
const defaultOtlpServiceName = "beep-repo-memory-sidecar";
const defaultVersion = "0.0.0";
const repoRootMarkers = [".git", "bun.lock"] as const;
const defaultAppDataDir = ".beep/repo-memory";

class PackageJsonVersion extends S.Class<PackageJsonVersion>($I`PackageJsonVersion`)({ version: S.String }) {}
/**
 * Normalize optional text config values by trimming and dropping empty results.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { normalizeOptionalText } from "@beep/runtime-server/internal/SidecarRuntimeConfig"
 *
 * const normalized = normalizeOptionalText(O.some(" repo-memory "))
 *
 * void normalized
 * ```
 *
 * @since 0.0.0
 * @category helpers
 */
export const normalizeOptionalText = flow(O.map(Str.trim), O.flatMap(O.liftPredicate(Str.isNonEmpty)));

const parseOtlpResourceAttributes = (value: O.Option<string>): Record<string, string> =>
  pipe(
    value,
    normalizeOptionalText,
    O.match({
      onNone: R.empty<string, string>,
      onSome: flow(
        Str.split(","),
        A.reduce(A.empty<readonly [string, string]>(), (entries, pair) => {
          const separatorIndex = pipe(
            pair,
            Str.indexOf("="),
            O.getOrElse(() => -1) //
          );
          if (separatorIndex <= 0) {
            return entries;
          }

          const key = pipe(pair, Str.slice(0, separatorIndex), Str.trim);
          const value = pipe(pair, Str.slice(separatorIndex + 1), Str.trim);

          return Str.isNonEmpty(key) && Str.isNonEmpty(value) ? A.append(entries, [key, value] as const) : entries;
        }),
        R.fromEntries
      ),
    })
  );

/**
 * Typed OTEL configuration resolved for the sidecar runtime boundary.
 *
 * @example
 * ```ts
 * import { SidecarOtlpConfig } from "@beep/runtime-server/internal/SidecarRuntimeConfig"
 *
 * const config = new SidecarOtlpConfig({
 *   otlpServiceName: "repo-memory",
 *   otlpServiceVersion: "0.0.0",
 *   otlpResourceAttributes: {}
 * })
 *
 * void config
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class SidecarOtlpConfig extends S.Class<SidecarOtlpConfig>($I`SidecarOtlpConfig`)(
  {
    otlpServiceName: S.String,
    otlpServiceVersion: S.String,
    otlpResourceAttributes: S.Record(S.String, S.String),
  },
  $I.annote("SidecarOtlpConfig", {
    description: "Resolved OTEL service naming and resource attributes for the sidecar runtime boundary.",
  })
) {}

/**
 * Load OTEL configuration for the sidecar runtime from the ambient config provider.
 *
 * @example
 * ```ts
 * import { loadSidecarOtlpConfig } from "@beep/runtime-server/internal/SidecarRuntimeConfig"
 *
 * const configEffect = loadSidecarOtlpConfig("0.0.0")
 *
 * void configEffect
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const loadSidecarOtlpConfig = Effect.fn("SidecarRuntime.loadOtlpConfig")(function* (version: string) {
  const otlpServiceNameValue = yield* Config.option(Config.string("OTEL_SERVICE_NAME"));
  const otlpServiceVersionValue = yield* Config.option(Config.string("OTEL_SERVICE_VERSION"));
  const otlpResourceAttributesValue = yield* Config.option(Config.string("OTEL_RESOURCE_ATTRIBUTES"));

  return new SidecarOtlpConfig({
    otlpServiceName: O.getOrElse(normalizeOptionalText(otlpServiceNameValue), () => defaultOtlpServiceName),
    otlpServiceVersion: O.getOrElse(normalizeOptionalText(otlpServiceVersionValue), () => version),
    otlpResourceAttributes: parseOtlpResourceAttributes(otlpResourceAttributesValue),
  });
});

const findRepoRootOrStart = Effect.fn("SidecarRuntime.findRepoRootOrStart")(function* (startDirectory: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const resolvedStartDirectory = path.resolve(startDirectory);

  let currentDirectory = resolvedStartDirectory;

  while (true) {
    for (const marker of repoRootMarkers) {
      const markerExists = yield* fs
        .exists(path.join(currentDirectory, marker))
        .pipe(Effect.orElseSucceed(() => false));

      if (markerExists) {
        return currentDirectory;
      }
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      return resolvedStartDirectory;
    }

    currentDirectory = parentDirectory;
  }
});

/**
 * Resolve the sidecar sqlite app-data directory, anchoring the default path at
 * the repository root while leaving explicit overrides relative to the current
 * working directory.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { resolveSidecarAppDataDir } from "@beep/runtime-server/internal/SidecarRuntimeConfig"
 *
 * const appDataDirEffect = resolveSidecarAppDataDir(O.none())
 *
 * void appDataDirEffect
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const resolveSidecarAppDataDir = Effect.fn("SidecarRuntime.resolveAppDataDir")(function* (
  appDataDir: O.Option<string>
) {
  const path = yield* Path.Path;

  return yield* O.match(appDataDir, {
    onNone: () =>
      findRepoRootOrStart(process.cwd()).pipe(Effect.map((repoRoot) => path.resolve(repoRoot, defaultAppDataDir))),
    onSome: (configuredAppDataDir) => Effect.succeed(path.resolve(configuredAppDataDir)),
  });
});

/**
 * Resolve the sidecar version from the environment or package.json.
 *
 * Priority:
 *
 *
 *
 *
 *
 * @example
 * ```ts
 * import { resolveSidecarVersion } from "@beep/runtime-server/internal/SidecarRuntimeConfig"
 *
 * const versionEffect = resolveSidecarVersion(".")
 *
 * void versionEffect
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const resolveSidecarVersion = Effect.fn("SidecarRuntime.resolveVersion")(function* (packageJsonDir: string) {
  const envVersion = yield* Config.option(Config.string("BEEP_REPO_MEMORY_VERSION"));
  const resolved = normalizeOptionalText(envVersion);

  if (O.isSome(resolved)) {
    return resolved.value;
  }

  const fs = yield* FileSystem.FileSystem;
  const pathService = yield* Path.Path;
  const packageJsonPath = pathService.resolve(packageJsonDir, "package.json");

  const PackageJsonVersionJson = S.fromJsonString(PackageJsonVersion);

  return yield* fs.readFileString(packageJsonPath).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (input: unknown) {
        return yield* S.decodeUnknownEffect(PackageJsonVersionJson)(input);
      })
    ),
    Effect.map((pkg) => pkg.version),
    Effect.orElseSucceed(() => defaultVersion)
  );
});
