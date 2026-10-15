/**
 * Instrument declarations owned by `@beep/practice-kg-mcp`: the tool id and
 * tool failure reason attribute keys the strict tier exports.
 *
 * **Details**
 *
 * The repo catalog command merges this file with every other package's
 * `*.instruments.ts` file, and the strict host builds its own catalog from it
 * at startup. Both keys are static: their values are the toolkit's tool names
 * and the literal failure reasons, which tests pin against the toolkit and the
 * failure-reason schema. This file imports only the catalog kernel so the
 * catalog command can load it cheaply.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $PracticeKgMcpId } from "@beep/identity/packages";
import { AttributeKey, AttributeKeyName, InstrumentDeclarations, PackageName } from "@beep/observability/catalog";
import { LiteralKit } from "@beep/schema";
import * as O from "effect/Option";

const $I = $PracticeKgMcpId.create("telemetry/PracticeKgTelemetry.instruments");

const owner = PackageName.make("@beep/practice-kg-mcp");

/**
 * Name of one practice KG tool, the only span name the strict tier exports.
 *
 * **Example** (Check a tool id)
 *
 * ```ts
 * import { PracticeKgToolId } from "../../src/telemetry/PracticeKgTelemetry.instruments.ts"
 *
 * console.log(PracticeKgToolId.is.kg_find("kg_find")) // true
 * console.log(PracticeKgToolId.literals.length) // 11
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PracticeKgToolId = LiteralKit([
  "kg_clients",
  "kg_docket_family",
  "kg_application_lookup",
  "kg_find",
  "corpus_search_text",
  "corpus_get_document",
  "email_search",
  "kg_candidate_claims",
  "kg_matter_lookup",
  "kg_correspondent_lookup",
  "kg_provenance",
]).pipe(
  $I.annoteSchema("PracticeKgToolId", {
    description: "Name of one practice knowledge-graph MCP tool.",
  })
);

/**
 * Runtime type for {@link PracticeKgToolId}.
 *
 * @category models
 * @since 0.0.0
 */
export type PracticeKgToolId = typeof PracticeKgToolId.Type;

/**
 * Attribute key the strict gate writes a span's tool id to.
 *
 * **Example** (Read the tool key)
 *
 * ```ts
 * import { PracticeKgToolKey } from "../../src/telemetry/PracticeKgTelemetry.instruments.ts"
 *
 * console.log(PracticeKgToolKey) // "beep.practice_kg.tool"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const PracticeKgToolKey = AttributeKeyName.make("beep.practice_kg.tool");

/**
 * Attribute key a failed tool call's handler span carries its literal
 * failure reason under.
 *
 * **Example** (Read the failure reason key)
 *
 * ```ts
 * import { PracticeKgFailureReasonAttribute } from "../../src/telemetry/PracticeKgTelemetry.instruments.ts"
 *
 * console.log(PracticeKgFailureReasonAttribute) // "beep.practice_kg.failure_reason"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const PracticeKgFailureReasonAttribute = AttributeKeyName.make("beep.practice_kg.failure_reason");

/**
 * Practice KG declarations: the tool id and failure reason keys, both
 * allowed at the `shape-only` tier with literal values only.
 *
 * **Example** (Count the declared keys)
 *
 * ```ts
 * import { PracticeKgTelemetryInstruments } from "../../src/telemetry/PracticeKgTelemetry.instruments.ts"
 *
 * console.log(PracticeKgTelemetryInstruments.attributes.length) // 2
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const PracticeKgTelemetryInstruments = InstrumentDeclarations.make({
  attributes: [
    AttributeKey.make({
      key: PracticeKgToolKey,
      type: "string",
      signals: ["span", "metric"],
      cardinality: "static",
      minTier: "shape-only",
      values: O.some(PracticeKgToolId.literals),
      owner,
      description: "Practice KG tool a span or metric point belongs to.",
    }),
    AttributeKey.make({
      key: PracticeKgFailureReasonAttribute,
      type: "string",
      signals: ["span"],
      cardinality: "static",
      minTier: "shape-only",
      values: O.some(["store-query-failed", "row-decode-failed", "invalid-input"]),
      owner,
      description: "Literal reason a practice KG tool call failed; never the failure message.",
    }),
  ],
});
