/**
 * Instrument declarations owned by `@beep/observability`: the generic
 * attribute keys every package's telemetry may carry.
 *
 * **Details**
 *
 * The repo catalog command merges this file with every other package's
 * `*.instruments.ts` file. Each key here is static or bounded, so it is valid
 * as a metric label, and is allowed at every tier.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as O from "effect/Option";
import { IdentitySource, PackageFamily, SignalKind, TelemetryTier } from "./catalog/Catalog.literals.ts";
import { AttributeKey, InstrumentDeclarations } from "./catalog/Catalog.models.ts";
import { AttributeKeyName, PackageName } from "./catalog/Catalog.names.ts";

const owner = PackageName.make("@beep/observability");

/**
 * Kernel declarations: `beep.package`, `beep.family`, `beep.privacy_tier`,
 * `beep.identity_source` and `beep.outcome`.
 *
 * **Example** (List the kernel attribute keys)
 *
 * ```ts import.meta.vitest name="List the kernel attribute keys"
 * import { ObservabilityInstruments } from "@beep/observability/catalog"
 *
 * ObservabilityInstruments.attributes.length // => 5
 * ObservabilityInstruments.attributes[0]?.key // => "beep.package"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ObservabilityInstruments = InstrumentDeclarations.make({
  attributes: [
    AttributeKey.make({
      key: AttributeKeyName.make("beep.package"),
      type: "string",
      signals: SignalKind.literals,
      cardinality: "bounded",
      minTier: "shape-only",
      owner,
      description: "Scoped name of the package that emitted the record.",
    }),
    AttributeKey.make({
      key: AttributeKeyName.make("beep.family"),
      type: "string",
      signals: SignalKind.literals,
      cardinality: "static",
      minTier: "shape-only",
      values: O.some(PackageFamily.literals),
      owner,
      description: "Package family of the emitting package, derived from its path.",
    }),
    AttributeKey.make({
      key: AttributeKeyName.make("beep.privacy_tier"),
      type: "string",
      signals: SignalKind.literals,
      cardinality: "static",
      minTier: "shape-only",
      values: O.some(TelemetryTier.literals),
      owner,
      description: "Effective privacy tier the record was emitted at.",
    }),
    AttributeKey.make({
      key: AttributeKeyName.make("beep.identity_source"),
      type: "string",
      signals: SignalKind.literals,
      cardinality: "static",
      minTier: "shape-only",
      values: O.some(IdentitySource.literals),
      owner,
      description: "Whether the emitter identity was vouched for or self-claimed.",
    }),
    AttributeKey.make({
      key: AttributeKeyName.make("beep.outcome"),
      type: "string",
      signals: [SignalKind.Enum.metric],
      cardinality: "static",
      minTier: "shape-only",
      values: O.some(["started", "completed", "failed", "interrupted"]),
      owner,
      description: "Workflow lifecycle outcome stamped by observeWorkflow on its outcomes counter.",
    }),
  ],
});
