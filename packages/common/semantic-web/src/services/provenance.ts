/**
 * Provenance projection and export service contract.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { BoundedEvidenceProjection, EvidenceAnchor } from "../evidence.ts";
import {
  Activity,
  Agent,
  Attribution,
  Collection,
  Delegation,
  Derivation,
  End,
  Entity,
  Organization,
  Person,
  Plan,
  PrimarySource,
  ProvBundle,
  Quotation,
  Revision,
  SoftwareAgent,
  Start,
} from "../prov.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("services/provenance");

const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "PROV-O", disposition: "normative" }],
    equivalenceBasis: "Exact bundle, evidence, and bounded projection equality.",
    provenanceProfile: "minimal-core-v1",
    evidenceAnchoring: "Explicit evidence anchors remain first-class.",
    timeSemantics: "Lifecycle fields remain explicit adjuncts.",
  });

/**
 * Provenance export profile.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ProvenanceExportProfile = LiteralKit(["prov-core-v1", "prov-core-extensions-v1"] as const).annotate(
  $I.annote("ProvenanceExportProfile", {
    description: "Provenance export profile.",
  })
);

/**
 * Provenance projection request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ProjectProvenanceRequest extends S.Class<ProjectProvenanceRequest>($I`ProjectProvenanceRequest`)(
  {
    bundle: ProvBundle,
    anchors: S.Array(EvidenceAnchor),
    maxItems: NonNegativeInt,
  },
  $I.annote("ProjectProvenanceRequest", {
    description: "Provenance projection request.",
    semanticSchemaMetadata: serviceContractMetadata("ProjectProvenanceRequest", "Provenance projection request."),
  })
) {}

/**
 * Provenance summary request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SummarizeProvenanceRequest extends S.Class<SummarizeProvenanceRequest>($I`SummarizeProvenanceRequest`)(
  {
    bundle: ProvBundle,
    anchors: S.Array(EvidenceAnchor),
  },
  $I.annote("SummarizeProvenanceRequest", {
    description: "Provenance summary request.",
    semanticSchemaMetadata: serviceContractMetadata("SummarizeProvenanceRequest", "Provenance summary request."),
  })
) {}

/**
 * Provenance export request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ExportProvenanceRequest extends S.Class<ExportProvenanceRequest>($I`ExportProvenanceRequest`)(
  {
    bundle: ProvBundle,
    anchors: S.Array(EvidenceAnchor),
    profile: ProvenanceExportProfile,
    maxItems: NonNegativeInt,
  },
  $I.annote("ExportProvenanceRequest", {
    description: "Provenance export request.",
    semanticSchemaMetadata: serviceContractMetadata("ExportProvenanceRequest", "Provenance export request."),
  })
) {}

/**
 * Bounded provenance projection result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BoundedProvenanceProjection extends S.Class<BoundedProvenanceProjection>($I`BoundedProvenanceProjection`)(
  {
    bundle: ProvBundle,
    evidence: BoundedEvidenceProjection,
    truncated: S.Boolean,
  },
  $I.annote("BoundedProvenanceProjection", {
    description: "Bounded provenance projection result.",
    semanticSchemaMetadata: serviceContractMetadata(
      "BoundedProvenanceProjection",
      "Bounded provenance projection result."
    ),
  })
) {}

/**
 * Provenance summary result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ProvenanceSummary extends S.Class<ProvenanceSummary>($I`ProvenanceSummary`)(
  {
    recordCount: NonNegativeInt,
    entityCount: NonNegativeInt,
    activityCount: NonNegativeInt,
    agentCount: NonNegativeInt,
    anchorCount: NonNegativeInt,
  },
  $I.annote("ProvenanceSummary", {
    description: "Provenance summary result.",
    semanticSchemaMetadata: serviceContractMetadata("ProvenanceSummary", "Provenance summary result."),
  })
) {}

/**
 * Typed provenance service error.
 *
 * @since 0.0.0
 * @category Errors
 */
export class ProvenanceServiceError extends TaggedErrorClass<ProvenanceServiceError>($I`ProvenanceServiceError`)(
  "ProvenanceServiceError",
  {
    reason: LiteralKit(["missingEvidenceAnchor", "unsupportedProfile", "projectionLimit"] as const),
    message: S.String,
  },
  $I.annote("ProvenanceServiceError", {
    description: "Typed provenance service error.",
    semanticSchemaMetadata: serviceContractMetadata("ProvenanceServiceError", "Typed provenance service error."),
  })
) {}

/**
 * Provenance service contract shape.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface ProvenanceServiceShape {
  readonly exportBundle: (
    request: ExportProvenanceRequest
  ) => Effect.Effect<BoundedProvenanceProjection, ProvenanceServiceError>;
  readonly project: (
    request: ProjectProvenanceRequest
  ) => Effect.Effect<BoundedProvenanceProjection, ProvenanceServiceError>;
  readonly summarize: (request: SummarizeProvenanceRequest) => Effect.Effect<ProvenanceSummary, ProvenanceServiceError>;
}

/**
 * Provenance service tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class ProvenanceService extends Context.Service<ProvenanceService, ProvenanceServiceShape>()(
  $I`ProvenanceService`
) {}

type ProvRecord = ProvBundle["records"][number];

const takeUpTo = <A>(values: ReadonlyArray<A>, limit: number): ReadonlyArray<A> => pipe(values, A.take(limit));

const isEntityRecord = S.is(Entity);
const isActivityRecord = S.is(Activity);
const isAgentRecord = S.is(Agent);
const isSoftwareAgentRecord = S.is(SoftwareAgent);

const extensionTierRecordGuards: ReadonlyArray<(record: ProvRecord) => boolean> = [
  S.is(Plan),
  S.is(Collection),
  S.is(Person),
  S.is(Organization),
  S.is(Attribution),
  S.is(Delegation),
  S.is(Derivation),
  S.is(PrimarySource),
  S.is(Quotation),
  S.is(Revision),
  S.is(Start),
  S.is(End),
];

const isExtensionTierRecord = (record: ProvRecord): boolean =>
  pipe(
    extensionTierRecordGuards,
    A.some((guard) => guard(record))
  );

const countRecords = (
  records: ReadonlyArray<ProvRecord>,
  predicate: (record: ProvRecord) => boolean
): typeof NonNegativeInt.Type =>
  decodeNonNegativeInt(
    pipe(
      records,
      A.reduce(0, (count, record) => (predicate(record) ? count + 1 : count))
    )
  );

const createProjection = (
  bundle: ProvBundle,
  anchors: ReadonlyArray<EvidenceAnchor>,
  maxItems: number
): BoundedProvenanceProjection => {
  const limitedRecords = takeUpTo(bundle.records, maxItems);
  const limitedAnchors = takeUpTo(anchors, maxItems);
  const truncated = bundle.records.length > maxItems || anchors.length > maxItems;

  return BoundedProvenanceProjection.make({
    bundle: ProvBundle.make({
      records: limitedRecords,
      lifecycle: bundle.lifecycle,
    }),
    evidence: BoundedEvidenceProjection.make({
      anchors: limitedAnchors,
      truncated,
    }),
    truncated,
  });
};

/**
 * Live provenance service implementation for bounded projection and summary work.
 *
 * @since 0.0.0
 * @category Layers
 */
export const ProvenanceServiceLive = Layer.succeed(
  ProvenanceService,
  ProvenanceService.of({
    project: Effect.fn(function* (request: ProjectProvenanceRequest) {
      if (request.bundle.records.length > 0 && request.anchors.length === 0) {
        return yield* new ProvenanceServiceError({
          reason: "missingEvidenceAnchor",
          message: "Bounded provenance projections require explicit evidence anchors.",
        });
      }

      return createProjection(request.bundle, request.anchors, request.maxItems);
    }),
    summarize: Effect.fn((request: SummarizeProvenanceRequest) =>
      Effect.succeed(
        ProvenanceSummary.make({
          recordCount: decodeNonNegativeInt(request.bundle.records.length),
          entityCount: countRecords(request.bundle.records, isEntityRecord),
          activityCount: countRecords(request.bundle.records, isActivityRecord),
          agentCount: countRecords(
            request.bundle.records,
            (record) => isAgentRecord(record) || isSoftwareAgentRecord(record)
          ),
          anchorCount: decodeNonNegativeInt(request.anchors.length),
        })
      )
    ),
    exportBundle: Effect.fn(function* (request: ExportProvenanceRequest) {
      if (request.profile === "prov-core-v1" && pipe(request.bundle.records, A.some(isExtensionTierRecord))) {
        return yield* new ProvenanceServiceError({
          reason: "unsupportedProfile",
          message: "prov-core-v1 does not include extension-tier provenance records.",
        });
      }

      return createProjection(request.bundle, request.anchors, request.maxItems);
    }),
  })
);
