/**
 * Provides the deferred npm registry, executor and publishing services.
 *
 * **Details**
 *
 * The pure npm vocabulary (specifiers, manifests, integrity hashes, registry
 * kinds, catalog and workspace resolvers) lives in `@beep/npm-spec`; import it
 * from that package's leaf modules. This entrypoint exports only the driver
 * half that stays in the scratchpad until its first consumer (SPEC D-05).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export { NpmExecutor } from "./NpmExecutor.ts";
// Free-standing named exports, never gathered into a namespace object: a
// consumer that imports only the pure vocabulary (IntegrityHash, the
// specifier) must not link the HTTP client this module reaches. A namespace
// object is one live binding and would retain the whole graph — the
// config-file codec hazard, one package over.
export {
	NpmRegistry,
	type NpmRegistryShape,
	type NpmRegistryStubs,
	PublishTime,
	PublishedVersion,
	RegistryReadError,
	type RegistrySeed,
	type RegistryTarget,
	type SeededVersion,
} from "./NpmRegistry.ts";
export {
	type DryRunOutcome,
	type PackOptions,
	PackagePublish,
	type PackagePublishShape,
	type PackagePublishStubs,
	PackedTarball,
	type PublishOptions,
	type PublishOutcome,
} from "./PackagePublish.ts";
export { PackageTarball, type PackageTarballShape, TarballError } from "./PackageTarball.ts";
export { PublishError } from "./PublishError.ts";
