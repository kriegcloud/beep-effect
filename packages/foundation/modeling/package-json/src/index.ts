/**
 * package.json parsing, editing, validation and file IO as Effect schemas.
 *
 * **Details**
 *
 * The {@link Package} class is the schema: typed known fields plus a `rest`
 * catch-all for round-trip fidelity, computed getters, dual-signature mutation
 * statics, and {@link Package.resolve} over the `@beep/npm-spec` resolver
 * contracts. Leaf concepts (`PackageName`, `SpdxLicense`, {@link PackageManager},
 * {@link Person}, {@link DevEngine}, {@link Dependency}) carry their own
 * statics and errors and compose into `Package`'s fields; dependency
 * specifiers come from `@beep/npm-spec` and edits from `@beep/jsonc`, imported
 * from those packages rather than re-exported here. `Package` and
 * {@link Person} are the two object-shaped models, and both carry the `rest`
 * catch-all; the remaining leaves model a single scalar or a closed shape and
 * so have no unknown keys to preserve.
 *
 * `PackageJsonFile` is the only IO surface, over core `FileSystem` / `Path`. It
 * is a subpath import (`@beep/package-json/PackageJsonFile`), never this
 * barrel, so the root import closure stays IO-free. {@link PackageValidator}
 * runs rule-based validation over a decoded `Package`; {@link PackageJsonFormat}
 * sorts and formats without decoding, for hosts that must accept manifests
 * `Package.decode` rejects.
 *
 * {@link PackageManifest} is the presence-lenient model — `name` / `version`
 * optional, `packageManager` accepting the range spelling as
 * {@link PackageManagerRange} — for the private workspace-root shape the
 * strict `Package` rejects; {@link LenientManifest} is the shape-lenient
 * discovery tier below it, degrading malformed fields to absence (preserved
 * in `rest`, reported on `issues`) instead of failing the document; and
 * `PackageJsonFormat.modify` / `PackageJsonFile.modify` are the surgical,
 * byte-preserving field edits for tools that mutate other people's manifests.
 *
 * @packageDocumentation
 */

export { Dependency, isUnresolvedDependency, type UnresolvedDependency } from "./Dependency.ts";
export { DevEngine, DevEngineOrArray, type DevEngines, DevEnginesSchema } from "./DevEngines.ts";
export {
  EntryPointManifest,
  ResolveEntryPointOptions,
  resolveEntryPoint,
  UnresolvedEntryPointError,
} from "./EntryPoint.ts";
export { Funding } from "./Funding.ts";
export { LenientFieldIssue, LenientManifest } from "./LenientManifest.ts";
export { InvalidSpdxLicenseError, isValidSpdx, licenseExpressionOf, SpdxLicense } from "./License.ts";
export {
  BinField,
  DependencyMapField,
  ExportsField,
  Package,
  PackageDecodeError,
  PackageFormatOptions,
  type PackageIndent,
  type PackagePatch,
  PeerDependenciesMetaField,
  PeerDependencyMeta,
  PublishConfigField,
  StringMapField,
} from "./Package.ts";
export {
  PackageFormatTextOptions,
  PackageJsonFormat,
  PackageJsonModifyError,
  PackageJsonSyntaxError,
} from "./PackageJsonFormat.ts";
export { PackageManager } from "./PackageManager.ts";
export {
  DevEnginePackageManagerEntry,
  InvalidPackageManagerRangeError,
  PackageManagerRange,
} from "./PackageManagerRange.ts";
export { PackageManifest } from "./PackageManifest.ts";
export {
  InvalidPackageNameError,
  PackageName,
  ScopedPackageName,
  UnscopedPackageName,
} from "./PackageName.ts";
export {
  defaultRules,
  noLocalDepsRule,
  noUnresolvedDepsRule,
  PackageValidationError,
  PackageValidator,
  RuleFailure,
  ValidationRule,
} from "./PackageValidator.ts";
export { ManifestEmail, Person } from "./Person.ts";
export { Bugs, Repository } from "./Repository.ts";
