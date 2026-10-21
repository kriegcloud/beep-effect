/**
 * Target-filesystem atomic-exchange capability for native configuration writes.
 *
 * **Details**
 *
 * Exchange support is a property of the filesystem that holds the target, not
 * of the host. The writer identifies that filesystem by the device id of the
 * target's parent directory, together with the filesystem type when the host
 * reports one, and caches one probe result per identity.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Models/Models.exchange.schemas");

const ModelsExchangeUnsupportedReasonKit = LiteralKit(["exdev", "einval", "eperm", "enosys", "unknown"]);

/**
 * Why a target filesystem cannot exchange two pathnames atomically.
 *
 * **Details**
 *
 * The first four reasons are the errno values `renameat2(RENAME_EXCHANGE)`
 * returns: `exdev` (the pathnames are on different mounts, including a target
 * that is itself a mount point), `einval` (the filesystem does not implement
 * the flag), `eperm` (the filesystem or a security module forbids it) and
 * `enosys` (the kernel has no `renameat2`). Every other refusal, such as an
 * `mv` without `--exchange` or a probe whose files were not swapped, is
 * `unknown`.
 *
 * **Example** (Guard a reason)
 *
 * ```ts
 * import { ModelsExchangeUnsupportedReason } from "@beep/repo-cli/commands/Models/Models.exchange.schemas"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(ModelsExchangeUnsupportedReason)("exdev")) // true
 * console.log(S.is(ModelsExchangeUnsupportedReason)("enoent")) // false
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ModelsExchangeUnsupportedReason = ModelsExchangeUnsupportedReasonKit.pipe(
  $I.annoteSchema("ModelsExchangeUnsupportedReason", {
    description: "Typed errno-derived reason a target filesystem cannot exchange two pathnames atomically.",
  })
);

/**
 * Runtime type of {@link ModelsExchangeUnsupportedReason}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ModelsExchangeUnsupportedReason = typeof ModelsExchangeUnsupportedReason.Type;

/**
 * Mount identity of the filesystem that holds a native target.
 *
 * **Details**
 *
 * `device` is the `stat` device id of the target's parent directory.
 * `filesystemType` is the type name the host reports for that directory, when
 * it reports one. Two targets share a cached capability only when both fields
 * are equal, so a remount, a different device or a newly reported type forces a
 * fresh probe.
 *
 * **Example** (Describe a filesystem)
 *
 * ```ts
 * import { ModelsExchangeFilesystemIdentity } from "@beep/repo-cli/commands/Models/Models.exchange.schemas"
 * import * as O from "effect/Option"
 *
 * const identity = ModelsExchangeFilesystemIdentity.make({ device: 64769n, filesystemType: O.some("ext2/ext3") })
 * console.log(identity.device) // 64769n
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ModelsExchangeFilesystemIdentity extends S.Opaque<
  ModelsExchangeFilesystemIdentity,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    device: S.BigInt,
    filesystemType: S.OptionFromOptionalKey(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("ModelsExchangeFilesystemIdentity", {
      description: "Parent-directory device id and reported filesystem type that key the exchange capability cache.",
    })
  )
) {}

/**
 * The cache key for one filesystem identity.
 *
 * **Example** (Key an identity)
 *
 * ```ts
 * import {
 *   ModelsExchangeFilesystemIdentity,
 *   modelsExchangeIdentityKey
 * } from "@beep/repo-cli/commands/Models/Models.exchange.schemas"
 * import * as O from "effect/Option"
 *
 * const identity = ModelsExchangeFilesystemIdentity.make({ device: 7n, filesystemType: O.some("tmpfs") })
 * console.log(modelsExchangeIdentityKey(identity)) // "7:tmpfs"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const modelsExchangeIdentityKey = (identity: ModelsExchangeFilesystemIdentity): string =>
  `${identity.device}:${O.getOrElse(identity.filesystemType, () => "")}`;

/**
 * Whether a target filesystem supports atomic pathname exchange.
 *
 * **Details**
 *
 * `unsupported` carries the typed reason and the host's explanation, which the
 * writer repeats in its refusal.
 *
 * **Example** (Record an unsupported filesystem)
 *
 * ```ts
 * import { ModelsExchangeCapability } from "@beep/repo-cli/commands/Models/Models.exchange.schemas"
 *
 * const capability = ModelsExchangeCapability.cases.unsupported.make({
 *   reason: "exdev",
 *   detail: "Invalid cross-device link"
 * })
 * console.log(capability._tag) // "unsupported"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ModelsExchangeCapability = S.TaggedUnion({
  supported: {},
  unsupported: { reason: ModelsExchangeUnsupportedReason, detail: S.String },
}).pipe(
  $I.annoteSchema("ModelsExchangeCapability", {
    description: "Supported, or unsupported with a typed errno-derived reason, for one target filesystem.",
  })
);

/**
 * Runtime type of {@link ModelsExchangeCapability}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ModelsExchangeCapability = typeof ModelsExchangeCapability.Type;

/**
 * The capability verdict for one native target and the filesystem it names.
 *
 * **Details**
 *
 * `directory` is the target's parent directory, where the probe created and
 * removed its disposable files.
 *
 * **Example** (Read a qualification)
 *
 * ```ts
 * import {
 *   ModelsExchangeCapability,
 *   ModelsExchangeFilesystemIdentity,
 *   ModelsExchangeQualification
 * } from "@beep/repo-cli/commands/Models/Models.exchange.schemas"
 * import * as O from "effect/Option"
 *
 * const qualification = ModelsExchangeQualification.make({
 *   directory: "/srv/config",
 *   identity: ModelsExchangeFilesystemIdentity.make({ device: 7n, filesystemType: O.none() }),
 *   capability: ModelsExchangeCapability.cases.supported.make({})
 * })
 * console.log(qualification.capability._tag) // "supported"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ModelsExchangeQualification extends S.Opaque<
  ModelsExchangeQualification,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    directory: S.NonEmptyString,
    identity: ModelsExchangeFilesystemIdentity,
    capability: ModelsExchangeCapability,
  }).pipe(
    $I.annoteSchema("ModelsExchangeQualification", {
      description: "Exchange capability of a native target's filesystem, with the identity that keyed it.",
    })
  )
) {}
