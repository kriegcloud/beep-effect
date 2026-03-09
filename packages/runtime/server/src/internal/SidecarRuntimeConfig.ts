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
 * @since 0.0.0
 * @category Helpers
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
          const separatorIndex = pipe(pair, Str.indexOf("="), (index) => index ?? -1);
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category Configuration
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
 * @since 0.0.0
 * @category Configuration
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
 *   1. `BEEP_REPO_MEMORY_VERSION` environment variable
 *   2. `version` field of the nearest `package.json` relative to the given
 *      base directory
 *   3. `"0.0.0"` hard-coded fallback
 *
 * @since 0.0.0
 * @category Configuration
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
    Effect.flatMap(S.decodeUnknownEffect(PackageJsonVersionJson)),
    Effect.map((pkg) => pkg.version),
    Effect.orElseSucceed(() => defaultVersion)
  );
});
