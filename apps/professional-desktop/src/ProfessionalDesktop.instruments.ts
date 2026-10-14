/**
 * Instrument declarations owned by `@beep/professional-desktop`: the desktop
 * operation counters and durations, their operation attribute, and the
 * orchestrator spans that carry it.
 *
 * **Details**
 *
 * Each orchestrator records one counter with a `beep.outcome` attribute
 * instead of separate started, completed, failed and interrupted counters.
 * The orchestrators read metric names from these declarations, so the
 * catalog and the emitted names cannot drift.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {
  AttributeKey,
  AttributeKeyName,
  InstrumentDeclarations,
  MetricInstrument,
  MetricName,
  PackageName,
  SpanInstrument,
  SpanName,
  UcumUnit,
} from "@beep/observability/catalog";
import * as O from "effect/Option";

const owner = PackageName.make("@beep/professional-desktop");
const operationKey = AttributeKeyName.make("beep.desktop.operation");
const outcomeKey = AttributeKeyName.make("beep.outcome");

const operationCounter = (name: string, description: string): MetricInstrument =>
  MetricInstrument.make({
    name: MetricName.make(name),
    owner,
    attributes: [operationKey, outcomeKey],
    minTier: "shape-only",
    description,
    kind: "counter",
    unit: UcumUnit.make("{operation}"),
  });

const operationDuration = (name: string, description: string): MetricInstrument =>
  MetricInstrument.make({
    name: MetricName.make(name),
    owner,
    attributes: [operationKey],
    minTier: "shape-only",
    description,
    kind: "histogram",
    unit: UcumUnit.make("ms"),
  });

const orchestratorSpan = (name: string, description: string): SpanInstrument =>
  SpanInstrument.make({
    name: SpanName.make(name),
    owner,
    family: "app",
    attributes: [operationKey],
    minTier: "shape-only",
    description,
    kind: "internal",
  });

/**
 * Document intake operation counter, by operation and outcome.
 *
 * **Example** (Read the intake counter name)
 *
 * ```ts
 * import { IntakeOperations } from "@/ProfessionalDesktop.instruments"
 *
 * console.log(IntakeOperations.name) // "beep.desktop.intake_operations"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const IntakeOperations = operationCounter(
  "beep.desktop.intake_operations",
  "Document intake RPC operations, counted at start and at each terminal outcome."
);

/**
 * Document intake operation duration.
 *
 * **Example** (Read the intake duration name)
 *
 * ```ts
 * import { IntakeOperationDuration } from "@/ProfessionalDesktop.instruments"
 *
 * console.log(IntakeOperationDuration.unit) // "ms"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const IntakeOperationDuration = operationDuration(
  "beep.desktop.intake_operation_duration",
  "Wall time of one document intake RPC operation."
);

/**
 * Ontology operation counter, by operation and outcome.
 *
 * **Example** (Read the ontology counter name)
 *
 * ```ts
 * import { OntologyOperations } from "@/ProfessionalDesktop.instruments"
 *
 * console.log(OntologyOperations.name) // "beep.desktop.ontology_operations"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const OntologyOperations = operationCounter(
  "beep.desktop.ontology_operations",
  "Ontology RPC operations, counted at start and at each terminal outcome."
);

/**
 * Ontology operation duration.
 *
 * **Example** (Read the ontology duration name)
 *
 * ```ts
 * import { OntologyOperationDuration } from "@/ProfessionalDesktop.instruments"
 *
 * console.log(OntologyOperationDuration.kind) // "histogram"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const OntologyOperationDuration = operationDuration(
  "beep.desktop.ontology_operation_duration",
  "Wall time of one ontology RPC operation."
);

/**
 * Vault sync operation counter, by operation and outcome.
 *
 * **Example** (Read the vault sync counter name)
 *
 * ```ts
 * import { VaultSyncOperations } from "@/ProfessionalDesktop.instruments"
 *
 * console.log(VaultSyncOperations.name) // "beep.desktop.vault_sync_operations"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VaultSyncOperations = operationCounter(
  "beep.desktop.vault_sync_operations",
  "Vault sync RPC operations, counted at start and at each terminal outcome."
);

/**
 * Vault sync operation duration.
 *
 * **Example** (Read the vault sync duration name)
 *
 * ```ts
 * import { VaultSyncOperationDuration } from "@/ProfessionalDesktop.instruments"
 *
 * console.log(VaultSyncOperationDuration.name) // "beep.desktop.vault_sync_operation_duration"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VaultSyncOperationDuration = operationDuration(
  "beep.desktop.vault_sync_operation_duration",
  "Wall time of one vault sync RPC operation."
);

/**
 * Desktop declarations: the operation key, the three operation counters and
 * durations, and the orchestrator spans that carry the operation key.
 *
 * **Example** (Count the desktop metrics)
 *
 * ```ts
 * import { ProfessionalDesktopInstruments } from "@/ProfessionalDesktop.instruments"
 *
 * console.log(ProfessionalDesktopInstruments.instruments.length) // 9
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ProfessionalDesktopInstruments = InstrumentDeclarations.make({
  attributes: [
    AttributeKey.make({
      key: operationKey,
      type: "string",
      signals: ["span", "metric"],
      cardinality: "static",
      minTier: "shape-only",
      values: O.some([
        "apply_batch",
        "dropped_file",
        "export_provenance",
        "get_snapshot",
        "get_status",
        "get_workspace_vault",
        "list_conflicts",
        "mark_conflict_reviewed",
        "open_document",
        "preview_turtle",
        "run_inference",
        "run_sparql",
        "run_validation",
        "save_document",
        "set_workspace_vault",
        "trigger",
      ]),
      owner,
      description: "Desktop RPC operation an orchestrator ran.",
    }),
  ],
  instruments: [
    IntakeOperations,
    IntakeOperationDuration,
    OntologyOperations,
    OntologyOperationDuration,
    VaultSyncOperations,
    VaultSyncOperationDuration,
    orchestratorSpan("DesktopIntake.run", "One document intake RPC operation."),
    orchestratorSpan("DesktopOntology.run", "One ontology RPC operation."),
    orchestratorSpan("DesktopVaultSync.run", "One vault sync RPC operation."),
  ],
});
