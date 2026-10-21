/**
 * npm dependency specifiers, manifests, integrity hashes and workspace catalog resolution.
 *
 * **Details**
 *
 * The pure half of the npm vocabulary: every module here is free of IO, so a
 * contracts-only consumer (a lockfile or package.json model) can import it
 * without linking an HTTP client or a subprocess runner. Each symbol is
 * exported by name rather than through a namespace object, so a bundler can
 * drop what a consumer does not use.
 *
 * **Example** (Classify a dependency specifier)
 *
 * ```ts
 * import { DependencySpecifier } from "@beep/npm-spec/DependencySpecifier";
 * import * as S from "effect/Schema";
 *
 * const specifier = S.decodeUnknownSync(DependencySpecifier)("catalog:");
 *
 * console.log(DependencySpecifier.isCatalog(specifier)) // true
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Layer from "effect/Layer";
import { CatalogResolver } from "./CatalogResolver.ts";
import { WorkspaceResolver } from "./WorkspaceResolver.ts";

export { CatalogAssemblyError } from "./CatalogAssemblyError.ts";
export { CatalogResolver } from "./CatalogResolver.ts";
export {
  DependencyField,
  DependencyKind,
  DependencySection,
} from "./DependencySection.ts";
export {
  CatalogSpecifier,
  type ClassifiedSpecifier,
  DependencyProtocol,
  DependencySpecifier,
  type DependencySpecifierBrand,
  DistTagSpecifier,
  InvalidDependencySpecifierError,
  isValidDependencySpecifier,
  RangeSpecifier,
  RawSpecifier,
  WorkspaceSpecifier,
} from "./DependencySpecifier.ts";
export {
  CorepackIntegrityHash,
  IntegrityAlgorithm,
  IntegrityHash,
  type IntegrityHashBrand,
  InvalidIntegrityHashError,
  InvalidSriIntegrityHashError,
  isValidIntegrityHash,
  SriIntegrityHash,
} from "./IntegrityHash.ts";
export {
  Manifest,
  ManifestDecodeError,
  UnresolvedDependencyError,
} from "./Manifest.ts";
export {
  CachingPackageManager,
  DefaultCacheDirectoryOptions,
  PackageManagerCache,
} from "./PackageManagerCache.ts";
export {
  InvalidPackageManagerPinError,
  PackageManagerPin,
  PackageManagerPinName,
} from "./PackageManagerPin.ts";
export {
  BasicCredential,
  basicCredentialFromPair,
  InvalidBasicAuthUsernameError,
  type RegistryCredential,
  TokenCredential,
} from "./RegistryCredential.ts";
export {
  classifyRegistry,
  DEFAULT_REGISTRY,
  RegistryKind,
  registryDisplayName,
  registryHost,
  registryShortLabel,
} from "./RegistryKind.ts";
export { PartialReleaseAgeGate, ReleaseAgeGate } from "./ReleaseAgeGate.ts";
export { DependencyResolutionError, WorkspaceResolver } from "./WorkspaceResolver.ts";

/**
 * Composite no-op layer that merges `CatalogResolver.noop` and `WorkspaceResolver.noop`.
 *
 * **Details**
 *
 * Provide it once at the application boundary when a consumer needs the
 * resolver contracts to type-check while resolving nothing: both `rangeOf` and
 * `versionOf` return `Option.none()`. It is bound to a const so it memoizes by
 * reference; a getter would mint a fresh layer per access.
 *
 * **Example** (Provide both no-op dependency resolvers)
 *
 * ```ts
 * import { CatalogResolver } from "@beep/npm-spec/CatalogResolver";
 * import { Default } from "@beep/npm-spec/index";
 * import { WorkspaceResolver } from "@beep/npm-spec/WorkspaceResolver";
 * import * as Effect from "effect/Effect";
 * import * as O from "effect/Option";
 *
 * const program = Effect.gen(function* () {
 *   const catalog = yield* CatalogResolver;
 *   const workspace = yield* WorkspaceResolver;
 *   return yield* Effect.all([catalog.rangeOf("effect", O.none()), workspace.versionOf("@beep/semver")]);
 * });
 *
 * const results = Effect.runSync(Effect.provide(program, Default));
 * console.log(results.every(O.isSome)) // false
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const Default: Layer.Layer<CatalogResolver | WorkspaceResolver> = Layer.mergeAll(
  CatalogResolver.noop,
  WorkspaceResolver.noop
);
