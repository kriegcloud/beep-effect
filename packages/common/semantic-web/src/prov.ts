/**
 * Minimal stable PROV core and early extension tier for `@beep/semantic-web`.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { DateTime } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { makeSemanticSchemaMetadata } from "./semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("prov");

const iriRegExp = /^\w+:\/*([^:<>{}|\\^`"\s/]+[^<>{}|\\^`"\s]*(?::[^:<>{}|\\^`"\s]+)?)?$/;
const curieRegExp = /^[A-Za-z_][^\s:/]*:[^:<>{}|\\^`"\s]*(\?[^<>{}|\\^`" ]*)?(#[^<>{}|\\^`"\s]*)?$/;
const localPartRegExp = /^[^:<>{}|\\^`"\s]*(\?[^<>{}|\\^`"\s]*)?(#[^<>{}|\\^`"\s]*)?$/;
const dateTimeRegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

const provObjectRefChecks = S.makeFilterGroup(
  [
    S.makeFilter((value: string) => iriRegExp.test(value) || curieRegExp.test(value) || localPartRegExp.test(value), {
      identifier: $I`ProvObjectRefPatternCheck`,
      title: "PROV Object Reference Pattern",
      description: "A PROV object reference encoded as an IRI, CURIE, or local identifier.",
      message: "Object references must be valid IRIs, CURIEs, or local identifiers",
    }),
  ],
  {
    identifier: $I`ProvObjectRefChecks`,
    title: "PROV Object Reference",
    description: "Checks for PROV object references.",
  }
);

const provDateTimeChecks = S.makeFilterGroup(
  [
    S.isPattern(dateTimeRegExp, {
      identifier: $I`ProvDateTimePatternCheck`,
      title: "PROV Date Time Pattern",
      description: "An ISO 8601 date-time with optional fractional seconds and timezone offset.",
      message: "Expected an ISO 8601 date-time string",
    }),
    S.makeFilter((value: string) => O.isSome(DateTime.make(value)), {
      identifier: $I`ProvDateTimeParseableCheck`,
      title: "PROV Date Time Parseable",
      description: "A date-time string that can be parsed into an Effect DateTime value.",
      message: "Expected a parseable date-time string",
    }),
  ],
  {
    identifier: $I`ProvDateTimeChecks`,
    title: "PROV Date Time",
    description: "Checks for PROV timestamp fields.",
  }
);

/**
 * PROV object reference encoded as an IRI, CURIE, or local identifier.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { ObjectRef } from "@beep/semantic-web/prov"
 *
 * const ref = S.decodeUnknownSync(ObjectRef)("prov:entity1")
 * console.log(ref) // "prov:entity1"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ObjectRef = S.String.check(provObjectRefChecks).pipe(
  S.brand("ProvObjectRef"),
  S.annotate(
    $I.annote("ObjectRef", {
      description: "PROV object reference encoded as an IRI, CURIE, or local identifier.",
      semanticSchemaMetadata: makeSemanticSchemaMetadata({
        kind: "provenanceConstruct",
        canonicalName: "ObjectRef",
        overview: "PROV object reference encoded as an IRI, CURIE, or local identifier.",
        status: "stable",
        specifications: [{ name: "PROV-O", section: "Qualified Relations", disposition: "normative" }],
        equivalenceBasis: "Exact reference-string equality inside a bounded provenance bundle.",
        provenanceProfile: "minimal-core-v1",
      }),
    })
  )
);

/**
 * Type for {@link ObjectRef}.
 *
 * @example
 * ```ts
 * import type { ObjectRef } from "@beep/semantic-web/prov"
 *
 * const acceptObjectRef = (value: ObjectRef) => value
 * void acceptObjectRef
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ObjectRef = typeof ObjectRef.Type;

/**
 * Encoded PROV timestamp string.
 *
 * @example
 * ```ts
 * import { ProvDateTimeEncoded } from "@beep/semantic-web/prov"
 *
 * void ProvDateTimeEncoded
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ProvDateTimeEncoded = S.String.check(provDateTimeChecks).pipe(
  S.brand("ProvDateTimeEncoded"),
  S.annotate(
    $I.annote("ProvDateTimeEncoded", {
      description: "Encoded PROV timestamp string.",
      semanticSchemaMetadata: makeSemanticSchemaMetadata({
        kind: "provenanceConstruct",
        canonicalName: "ProvDateTimeEncoded",
        overview: "Encoded PROV timestamp string.",
        status: "stable",
        specifications: [{ name: "PROV-O", section: "Time", disposition: "normative" }],
        equivalenceBasis: "Canonical ISO string equality after decoding and re-encoding.",
        timeSemantics: "PROV activity and lifecycle timestamps remain distinct from domain lifecycle fields.",
      }),
    })
  )
);

/**
 * Type for {@link ProvDateTimeEncoded}.
 *
 * @example
 * ```ts
 * import type { ProvDateTimeEncoded } from "@beep/semantic-web/prov"
 *
 * const acceptProvDateTimeEncoded = (value: ProvDateTimeEncoded) => value
 * void acceptProvDateTimeEncoded
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ProvDateTimeEncoded = typeof ProvDateTimeEncoded.Type;

/**
 * PROV timestamp decoded to `DateTime.Utc`.
 *
 * @example
 * ```ts
 * import { ProvDateTime } from "@beep/semantic-web/prov"
 *
 * void ProvDateTime
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ProvDateTime = ProvDateTimeEncoded.pipe(
  S.decodeTo(S.DateTimeUtcFromString),
  S.annotate(
    $I.annote("ProvDateTime", {
      description: "PROV timestamp decoded to DateTime.Utc.",
      semanticSchemaMetadata: makeSemanticSchemaMetadata({
        kind: "provenanceConstruct",
        canonicalName: "ProvDateTime",
        overview: "PROV timestamp decoded to DateTime.Utc.",
        status: "stable",
        specifications: [{ name: "PROV-O", section: "Time", disposition: "normative" }],
        equivalenceBasis: "UTC instant equality.",
        timeSemantics: "PROV timestamps express activity and influence time, not all domain lifecycle semantics.",
      }),
    })
  )
);

/**
 * Type for {@link ProvDateTime}.
 *
 * @example
 * ```ts
 * import type { ProvDateTime } from "@beep/semantic-web/prov"
 *
 * const acceptProvDateTime = (value: ProvDateTime) => value
 * void acceptProvDateTime
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ProvDateTime = typeof ProvDateTime.Type;

/**
 * Explicit lifecycle time fields retained outside plain PROV activity timestamps.
 *
 * @example
 * ```ts
 * import { LifecycleTimes } from "@beep/semantic-web/prov"
 *
 * void LifecycleTimes
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class LifecycleTimes extends S.Class<LifecycleTimes>($I`LifecycleTimes`)(
  {
    observedAt: S.OptionFromOptionalKey(ProvDateTime),
    publishedAt: S.OptionFromOptionalKey(ProvDateTime),
    ingestedAt: S.OptionFromOptionalKey(ProvDateTime),
    assertedAt: S.OptionFromOptionalKey(ProvDateTime),
    derivedAt: S.OptionFromOptionalKey(ProvDateTime),
    effectiveAt: S.OptionFromOptionalKey(ProvDateTime),
    supersededAt: S.OptionFromOptionalKey(ProvDateTime),
  },
  $I.annote("LifecycleTimes", {
    description: "Explicit lifecycle time fields retained outside plain PROV activity timestamps.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "LifecycleTimes",
      overview: "Explicit lifecycle time fields retained outside plain PROV activity timestamps.",
      status: "stable",
      specifications: [{ name: "PROV-O", disposition: "informative" }],
      equivalenceBasis: "UTC instant equality per lifecycle field.",
      provenanceProfile: "minimal-core-v1",
      timeSemantics:
        "Lifecycle semantics remain explicit and are not collapsed into prov:startedAtTime or prov:endedAtTime.",
    }),
  })
) {}

/**
 * PROV entity.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { Entity } from "@beep/semantic-web/prov"
 *
 * const entity = S.decodeUnknownSync(Entity)({
 *
 *
 *
 * })
 * console.log(entity.provType) // "Entity"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Entity extends S.Class<Entity>($I`Entity`)(
  {
    provType: S.Literal("Entity"),
    id: S.OptionFromOptionalKey(ObjectRef),
    wasGeneratedBy: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    wasAttributedTo: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    hadPrimarySource: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    wasQuotedFrom: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    wasRevisionOf: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    wasDerivedFrom: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    generatedAtTime: S.OptionFromOptionalKey(ProvDateTime),
    invalidatedAtTime: S.OptionFromOptionalKey(ProvDateTime),
    value: S.OptionFromOptionalKey(S.Union([S.String, S.Number, S.Boolean])),
  },
  $I.annote("Entity", {
    description: "PROV entity.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "Entity",
      overview: "PROV entity.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "Entity", disposition: "normative" }],
      equivalenceBasis: "Identifier and field equality within a bounded provenance bundle.",
      provenanceProfile: "minimal-core-v1",
    }),
  })
) {}

/**
 * PROV activity.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { Activity } from "@beep/semantic-web/prov"
 *
 * const activity = S.decodeUnknownSync(Activity)({
 *
 *
 *
 * })
 * console.log(activity.provType) // "Activity"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Activity extends S.Class<Activity>($I`Activity`)(
  {
    provType: S.Literal("Activity"),
    id: S.OptionFromOptionalKey(ObjectRef),
    used: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    wasAssociatedWith: ObjectRef.pipe(S.Array, S.OptionFromOptionalKey),
    startedAtTime: S.OptionFromOptionalKey(ProvDateTime),
    endedAtTime: S.OptionFromOptionalKey(ProvDateTime),
  },
  $I.annote("Activity", {
    description: "PROV activity.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "Activity",
      overview: "PROV activity.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "Activity", disposition: "normative" }],
      equivalenceBasis: "Identifier and field equality within a bounded provenance bundle.",
      provenanceProfile: "minimal-core-v1",
    }),
  })
) {}

/**
 * PROV agent.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { Agent } from "@beep/semantic-web/prov"
 *
 * const agent = S.decodeUnknownSync(Agent)({
 *
 *
 *
 * })
 * console.log(agent.provType) // "Agent"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Agent extends S.Class<Agent>($I`Agent`)(
  {
    provType: S.Literal("Agent"),
    id: S.OptionFromOptionalKey(ObjectRef),
    name: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("Agent", {
    description: "PROV agent.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "Agent",
      overview: "PROV agent.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "Agent", disposition: "normative" }],
      equivalenceBasis: "Identifier and field equality within a bounded provenance bundle.",
      provenanceProfile: "minimal-core-v1",
    }),
  })
) {}

/**
 * PROV software agent.
 *
 * @example
 * ```ts
 * import { SoftwareAgent } from "@beep/semantic-web/prov"
 *
 * void SoftwareAgent
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SoftwareAgent extends S.Class<SoftwareAgent>($I`SoftwareAgent`)(
  {
    provType: S.Literal("SoftwareAgent"),
    id: S.OptionFromOptionalKey(ObjectRef),
    name: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("SoftwareAgent", {
    description: "PROV software agent.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "SoftwareAgent",
      overview: "PROV software agent.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "SoftwareAgent", disposition: "normative" }],
      equivalenceBasis: "Identifier and field equality within a bounded provenance bundle.",
      provenanceProfile: "minimal-core-v1",
    }),
  })
) {}

/**
 * PROV plan.
 *
 * @example
 * ```ts
 * import { Plan } from "@beep/semantic-web/prov"
 *
 * void Plan
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Plan extends S.Class<Plan>($I`Plan`)(
  {
    provType: S.Literal("Plan"),
    id: S.OptionFromOptionalKey(ObjectRef),
    name: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("Plan", {
    description: "PROV plan in the early extension tier.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "Plan",
      overview: "PROV plan in the early extension tier.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "Plan", disposition: "normative" }],
      equivalenceBasis: "Identifier and field equality within a bounded provenance bundle.",
      provenanceProfile: "extension-tier-v1",
    }),
  })
) {}

/**
 * PROV collection.
 *
 * @example
 * ```ts
 * import { Collection } from "@beep/semantic-web/prov"
 *
 * void Collection
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Collection extends S.Class<Collection>($I`Collection`)(
  {
    provType: S.Literal("Collection"),
    id: S.OptionFromOptionalKey(ObjectRef),
    hadMember: S.Array(ObjectRef),
  },
  $I.annote("Collection", {
    description: "PROV collection in the early extension tier.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "Collection",
      overview: "PROV collection in the early extension tier.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "Collection", disposition: "normative" }],
      equivalenceBasis: "Identifier and member equality within a bounded provenance bundle.",
      provenanceProfile: "extension-tier-v1",
    }),
  })
) {}

/**
 * PROV person.
 *
 * @example
 * ```ts
 * import { Person } from "@beep/semantic-web/prov"
 *
 * void Person
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Person extends S.Class<Person>($I`Person`)(
  {
    provType: S.Literal("Person"),
    id: S.OptionFromOptionalKey(ObjectRef),
    name: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("Person", {
    description: "PROV person in the early extension tier.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "Person",
      overview: "PROV person in the early extension tier.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "Person", disposition: "normative" }],
      equivalenceBasis: "Identifier and field equality within a bounded provenance bundle.",
      provenanceProfile: "extension-tier-v1",
    }),
  })
) {}

/**
 * PROV organization.
 *
 * @example
 * ```ts
 * import { Organization } from "@beep/semantic-web/prov"
 *
 * void Organization
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Organization extends S.Class<Organization>($I`Organization`)(
  {
    provType: S.Literal("Organization"),
    id: S.OptionFromOptionalKey(ObjectRef),
    name: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("Organization", {
    description: "PROV organization in the early extension tier.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "Organization",
      overview: "PROV organization in the early extension tier.",
      status: "stable",
      specifications: [{ name: "PROV-O", section: "Organization", disposition: "normative" }],
      equivalenceBasis: "Identifier and field equality within a bounded provenance bundle.",
      provenanceProfile: "extension-tier-v1",
    }),
  })
) {}

const relationMetadata = (canonicalName: string, overview: string, profile: "minimal-core-v1" | "extension-tier-v1") =>
  makeSemanticSchemaMetadata({
    kind: "provenanceConstruct",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "PROV-O", disposition: "normative" }],
    equivalenceBasis: "Field equality within a bounded provenance bundle.",
    provenanceProfile: profile,
  });

/**
 * PROV usage relation.
 *
 * @example
 * ```ts
 * import { Usage } from "@beep/semantic-web/prov"
 *
 * void Usage
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Usage extends S.Class<Usage>($I`Usage`)(
  {
    activity: ObjectRef,
    entity: ObjectRef,
    atTime: S.OptionFromOptionalKey(ProvDateTime),
  },
  $I.annote("Usage", {
    description: "PROV usage relation.",
    semanticSchemaMetadata: relationMetadata("Usage", "PROV usage relation.", "minimal-core-v1"),
  })
) {}

/**
 * PROV generation relation.
 *
 * @example
 * ```ts
 * import { Generation } from "@beep/semantic-web/prov"
 *
 * void Generation
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Generation extends S.Class<Generation>($I`Generation`)(
  {
    entity: ObjectRef,
    activity: ObjectRef,
    atTime: S.OptionFromOptionalKey(ProvDateTime),
  },
  $I.annote("Generation", {
    description: "PROV generation relation.",
    semanticSchemaMetadata: relationMetadata("Generation", "PROV generation relation.", "minimal-core-v1"),
  })
) {}

/**
 * PROV association relation.
 *
 * @example
 * ```ts
 * import { Association } from "@beep/semantic-web/prov"
 *
 * void Association
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Association extends S.Class<Association>($I`Association`)(
  {
    activity: ObjectRef,
    agent: ObjectRef,
    hadPlan: S.OptionFromOptionalKey(ObjectRef),
  },
  $I.annote("Association", {
    description: "PROV association relation.",
    semanticSchemaMetadata: relationMetadata("Association", "PROV association relation.", "minimal-core-v1"),
  })
) {}

/**
 * PROV attribution relation.
 *
 * @example
 * ```ts
 * import { Attribution } from "@beep/semantic-web/prov"
 *
 * void Attribution
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Attribution extends S.Class<Attribution>($I`Attribution`)(
  {
    entity: ObjectRef,
    agent: ObjectRef,
  },
  $I.annote("Attribution", {
    description: "PROV attribution relation.",
    semanticSchemaMetadata: relationMetadata("Attribution", "PROV attribution relation.", "extension-tier-v1"),
  })
) {}

/**
 * PROV delegation relation.
 *
 * @example
 * ```ts
 * import { Delegation } from "@beep/semantic-web/prov"
 *
 * void Delegation
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Delegation extends S.Class<Delegation>($I`Delegation`)(
  {
    delegate: ObjectRef,
    responsible: ObjectRef,
    activity: S.OptionFromOptionalKey(ObjectRef),
  },
  $I.annote("Delegation", {
    description: "PROV delegation relation.",
    semanticSchemaMetadata: relationMetadata("Delegation", "PROV delegation relation.", "extension-tier-v1"),
  })
) {}

/**
 * PROV derivation relation.
 *
 * @example
 * ```ts
 * import { Derivation } from "@beep/semantic-web/prov"
 *
 * void Derivation
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Derivation extends S.Class<Derivation>($I`Derivation`)(
  {
    generatedEntity: ObjectRef,
    usedEntity: ObjectRef,
  },
  $I.annote("Derivation", {
    description: "PROV derivation relation.",
    semanticSchemaMetadata: relationMetadata("Derivation", "PROV derivation relation.", "extension-tier-v1"),
  })
) {}

/**
 * PROV primary-source relation.
 *
 * @example
 * ```ts
 * import { PrimarySource } from "@beep/semantic-web/prov"
 *
 * void PrimarySource
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class PrimarySource extends S.Class<PrimarySource>($I`PrimarySource`)(
  {
    entity: ObjectRef,
    source: ObjectRef,
  },
  $I.annote("PrimarySource", {
    description: "PROV primary-source relation.",
    semanticSchemaMetadata: relationMetadata("PrimarySource", "PROV primary-source relation.", "extension-tier-v1"),
  })
) {}

/**
 * PROV quotation relation.
 *
 * @example
 * ```ts
 * import { Quotation } from "@beep/semantic-web/prov"
 *
 * void Quotation
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Quotation extends S.Class<Quotation>($I`Quotation`)(
  {
    entity: ObjectRef,
    source: ObjectRef,
  },
  $I.annote("Quotation", {
    description: "PROV quotation relation.",
    semanticSchemaMetadata: relationMetadata("Quotation", "PROV quotation relation.", "extension-tier-v1"),
  })
) {}

/**
 * PROV revision relation.
 *
 * @example
 * ```ts
 * import { Revision } from "@beep/semantic-web/prov"
 *
 * void Revision
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Revision extends S.Class<Revision>($I`Revision`)(
  {
    entity: ObjectRef,
    source: ObjectRef,
  },
  $I.annote("Revision", {
    description: "PROV revision relation.",
    semanticSchemaMetadata: relationMetadata("Revision", "PROV revision relation.", "extension-tier-v1"),
  })
) {}

/**
 * PROV start relation.
 *
 * @example
 * ```ts
 * import { Start } from "@beep/semantic-web/prov"
 *
 * void Start
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Start extends S.Class<Start>($I`Start`)(
  {
    activity: ObjectRef,
    trigger: ObjectRef,
    atTime: S.OptionFromOptionalKey(ProvDateTime),
  },
  $I.annote("Start", {
    description: "PROV start relation.",
    semanticSchemaMetadata: relationMetadata("Start", "PROV start relation.", "extension-tier-v1"),
  })
) {}

/**
 * PROV end relation.
 *
 * @example
 * ```ts
 * import { End } from "@beep/semantic-web/prov"
 *
 * void End
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class End extends S.Class<End>($I`End`)(
  {
    activity: ObjectRef,
    trigger: ObjectRef,
    atTime: S.OptionFromOptionalKey(ProvDateTime),
  },
  $I.annote("End", {
    description: "PROV end relation.",
    semanticSchemaMetadata: relationMetadata("End", "PROV end relation.", "extension-tier-v1"),
  })
) {}

/**
 * Public PROV record union for the stable semantic-web surface.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { Agent, ProvRecord } from "@beep/semantic-web/prov"
 *
 * const decoded = S.decodeUnknownSync(ProvRecord)({ provType: "Agent", name: "bob" })
 *
 * if (S.is(Agent)(decoded)) {
 *
 * }
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ProvRecord = S.Union([
  Entity,
  Activity,
  Agent,
  SoftwareAgent,
  Plan,
  Collection,
  Person,
  Organization,
  Usage,
  Generation,
  Association,
  Attribution,
  Delegation,
  Derivation,
  PrimarySource,
  Quotation,
  Revision,
  Start,
  End,
]).annotate(
  $I.annote("ProvRecord", {
    description: "Public PROV record union for the stable semantic-web surface.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "ProvRecord",
      overview: "Public PROV record union for the stable semantic-web surface.",
      status: "stable",
      specifications: [{ name: "PROV-O", disposition: "normative" }],
      equivalenceBasis: "Variant-aware field equality within a bounded provenance bundle.",
      provenanceProfile: "minimal-core-v1",
    }),
  })
);

/**
 * Type for {@link ProvRecord}.
 *
 * @example
 * ```ts
 * import type { ProvRecord } from "@beep/semantic-web/prov"
 *
 * const acceptProvRecord = (value: ProvRecord) => value
 * void acceptProvRecord
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ProvRecord = typeof ProvRecord.Type;

/**
 * Bounded provenance bundle exported by the semantic-web surface.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { ProvBundle } from "@beep/semantic-web/prov"
 *
 * const bundle = S.decodeUnknownSync(ProvBundle)({ records: [] })
 * console.log(bundle.records.length) // 0
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class ProvBundle extends S.Class<ProvBundle>($I`ProvBundle`)(
  {
    records: S.Array(ProvRecord),
    lifecycle: S.OptionFromOptionalKey(LifecycleTimes),
  },
  $I.annote("ProvBundle", {
    description: "Bounded provenance bundle exported by the semantic-web surface.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "ProvBundle",
      overview: "Bounded provenance bundle exported by the semantic-web surface.",
      status: "stable",
      specifications: [{ name: "PROV-O", disposition: "informative" }],
      equivalenceBasis: "Record collection equality plus lifecycle adjunct equality.",
      provenanceProfile: "minimal-core-v1",
      evidenceAnchoring: "Bundle exports are expected to be paired with explicit evidence anchors.",
      timeSemantics: "Lifecycle fields remain explicit adjuncts instead of being collapsed into activity timestamps.",
    }),
  })
) {}

/**
 * Public provenance entrypoint union.
 *
 * @example
 * ```ts
 * import { ProvO } from "@beep/semantic-web/prov"
 *
 * void ProvO
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ProvO = S.Union([ProvBundle, ProvRecord]).annotate(
  $I.annote("ProvO", {
    description: "Public provenance entrypoint union.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "ProvO",
      overview: "Public provenance entrypoint union for bounded provenance values and bundles.",
      status: "stable",
      specifications: [{ name: "PROV-O", disposition: "normative" }],
      equivalenceBasis: "Variant-aware field equality within a bounded provenance export.",
      provenanceProfile: "minimal-core-v1",
    }),
  })
);

/**
 * Type for {@link ProvO}.
 *
 * @example
 * ```ts
 * import type { ProvO } from "@beep/semantic-web/prov"
 *
 * const acceptProvO = (value: ProvO) => value
 * void acceptProvO
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ProvO = typeof ProvO.Type;
