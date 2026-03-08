import { $SchemaId } from "@beep/identity/packages";
import { DateTime, pipe } from "effect";
import * as A from "effect/Array";
import type * as Brand from "effect/Brand";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit, type LiteralKit as LiteralKitSchema } from "../../LiteralKit.ts";

const $I = $SchemaId.create("internal/ProvO/Prov0");
type SyncSchema = S.Top & { readonly DecodingServices: never };

const iriRegExp =
  /^\w+:\/*([^:<>{}|\\^`"\s/]+[^<>{}|\\^`"\s]*(?::[^:<>{}|\\^`"\s]+)?)?$/;
const curieRegExp = /^[A-Za-z_][^\s:/]*:[^:<>{}|\\^`"\s]*(\?[^<>{}|\\^`" ]*)?(#[^<>{}|\\^`"\s]*)?$/;
const localPartRegExp = /^[^:<>{}|\\^`"\s]*(\?[^<>{}|\\^`"\s]*)?(#[^<>{}|\\^`"\s]*)?$/;
const dateTimeRegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

const hasLiteral =
  (literals: ReadonlyArray<string>) =>
  (value: string): boolean =>
    pipe(
      literals,
      A.some((literal) => literal === value)
    );

const typeFieldHasAnyLiteral = (
  field: O.Option<string | ReadonlyArray<string>>,
  literals: ReadonlyArray<string>
): boolean =>
  pipe(
    field,
    O.exists((value) =>
      P.isString(value)
        ? hasLiteral(literals)(value)
        : pipe(
            value,
            A.some((item) => hasLiteral(literals)(item))
          )
    )
  );

const hasSomeOption = <A>(value: O.Option<A>): boolean => O.isSome(value);

const toInlineValues = <B>(value: unknown, isInline: (value: unknown) => value is B): ReadonlyArray<B> => {
  if (P.isString(value)) {
    return [];
  }

  if (globalThis.Array.isArray(value)) {
    return pipe(
      value,
      A.filter(isInline)
    );
  }

  return isInline(value) ? [value] : [];
};

const arrayContainsCanonicalLiteral = <L extends A.NonEmptyReadonlyArray<string>>(
  name: string,
  description: string,
  literalKit: LiteralKitSchema<L>
) =>
  S.makeFilter(
    (values: ReadonlyArray<string>) =>
      pipe(
        values,
        A.some((value) => hasLiteral(literalKit.Options)(value))
      ),
    {
      identifier: $I.create(name).make("ContainsCanonicalLiteralCheck"),
      title: `${name} Contains Canonical Literal`,
      description,
      message: `${name} arrays must contain at least one canonical literal`,
    }
  );

const literalOrArrayContaining = <L extends A.NonEmptyReadonlyArray<string>>(
  name: string,
  description: string,
  literalKit: LiteralKitSchema<L>
) =>
  S.Union([
    literalKit,
    S.Array(S.String).check(arrayContainsCanonicalLiteral(name, description, literalKit)),
  ]).annotate(
    $I.annote(name, {
      description,
    })
  );

const objectRefOrInline = (name: string, description: string, schema: () => SyncSchema) =>
  S.Union([ObjectRef, JsonReference, S.suspend(schema)]).annotate(
    $I.annote(name, {
      description,
    })
  );

const objectRefOrInlineOrMany = (name: string, description: string, schema: () => SyncSchema) =>
  S.Union([
    ObjectRef,
    JsonReference,
    S.suspend(schema),
    S.Array(S.Union([ObjectRef, JsonReference, S.suspend(schema)])),
  ]).annotate(
    $I.annote(name, {
      description,
    })
  );

const objectRefChecks = S.makeFilterGroup(
  [
    S.makeFilter((value: string) => iriRegExp.test(value) || curieRegExp.test(value) || localPartRegExp.test(value), {
      identifier: $I`ObjectRefPatternCheck`,
      title: "Object Reference Pattern",
      description: "A PROV object reference encoded as an IRI, CURIE, or local identifier.",
      message: "Object references must be valid IRIs, CURIEs, or local identifiers",
    }),
  ],
  {
    identifier: $I`ObjectRefChecks`,
    title: "Object Reference",
    description: "Checks for PROV object references.",
  }
);

/**
 * Branded PROV object reference.
 *
 * Mirrors the OGC `iri-or-curie` building block used by the upstream PROV schema.
 */
export const ObjectRef = S.String.check(objectRefChecks).pipe(
  S.brand("ProvObjectRef"),
  S.annotate(
    $I.annote("ObjectRef", {
      description: "A PROV object reference encoded as an IRI, CURIE, or local identifier.",
    })
  )
);

/**
 * Type for {@link ObjectRef}.
 */
export type ObjectRef = typeof ObjectRef.Type;

const openObjectChecks = S.makeFilterGroup(
  [
    S.makeFilter(P.isObject, {
      identifier: $I`OpenObjectRecordCheck`,
      title: "Open Object Record",
      description: "A generic object branch preserved from the OGC `MultipleOrObject` helper schema.",
      message: "Expected an object value",
    }),
  ],
  {
    identifier: $I`OpenObjectChecks`,
    title: "Open Object",
    description: "Checks for a permissive object branch.",
  }
);

const OpenObject = S.Record(S.String, S.Unknown).check(openObjectChecks).annotate(
  $I.annote("OpenObject", {
    description: "A permissive object branch used by the upstream OGC helper schemas.",
  })
);

const uriReferenceChecks = S.makeFilterGroup(
  [
    S.isNonEmpty({
      identifier: $I`UriReferenceNonEmptyCheck`,
      title: "URI Reference Non Empty",
      description: "A non-empty URI reference.",
      message: "URI references must not be empty",
    }),
    S.makeFilter((value: string) => globalThis.URL.canParse(value, "https://example.invalid"), {
      identifier: $I`UriReferenceFormatCheck`,
      title: "URI Reference Format",
      description: "A valid URI reference as defined by the OGC JSON link helper schema.",
      message: "Expected a valid URI reference",
    }),
  ],
  {
    identifier: $I`UriReferenceChecks`,
    title: "URI Reference",
    description: "Checks for JSON link href values.",
  }
);

const UriReference = S.String.check(uriReferenceChecks).pipe(
  S.brand("ProvUriReference"),
  S.annotate(
    $I.annote("UriReference", {
      description: "A URI reference used by the OGC JSON link helper schema.",
    })
  )
);

/**
 * JSON Reference object preserved for upstream `$ref` example payloads.
 */
export class JsonReference extends S.Class<JsonReference, Brand.Brand<"ProvJsonReference">>($I`JsonReference`)(
  {
    $ref: UriReference,
  },
  $I.annote("JsonReference", {
    description: "A JSON Reference object used by some upstream PROV example documents.",
  })
) {}

const linkRelationChecks = S.makeFilterGroup(
  [
    S.isNonEmpty({
      identifier: $I`LinkRelationNonEmptyCheck`,
      title: "Link Relation Non Empty",
      description: "A non-empty IANA link relation token.",
      message: "Link relations must not be empty",
    }),
    S.isTrimmed({
      identifier: $I`LinkRelationTrimmedCheck`,
      title: "Link Relation Trimmed",
      description: "A trimmed IANA link relation token.",
      message: "Link relations must be trimmed",
    }),
  ],
  {
    identifier: $I`LinkRelationChecks`,
    title: "Link Relation",
    description: "Checks for JSON link relation values.",
  }
);

const LinkRelation = S.String.check(linkRelationChecks).pipe(
  S.brand("ProvLinkRelation"),
  S.annotate(
    $I.annote("LinkRelation", {
      description: "An IANA link relation used by the OGC JSON link helper schema.",
    })
  )
);

const provDateTimeChecks = S.makeFilterGroup(
  [
    S.isPattern(dateTimeRegExp, {
      identifier: $I`ProvDateTimePatternCheck`,
      title: "PROV Date Time Pattern",
      description: "An ISO 8601 date-time with optional fractional seconds and timezone offset.",
      message: "Expected an ISO 8601 date-time string",
    }),
    S.makeFilter((value: string) => globalThis.Number.isFinite(globalThis.Date.parse(value)), {
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
 * Encoded PROV timestamp string.
 */
export const ProvDateTimeEncoded = S.String.check(provDateTimeChecks).pipe(
  S.brand("ProvDateTimeEncoded"),
  S.annotate(
    $I.annote("ProvDateTimeEncoded", {
      description: "An encoded PROV timestamp string in ISO 8601 form.",
    })
  )
);

/**
 * Type for {@link ProvDateTimeEncoded}.
 */
export type ProvDateTimeEncoded = typeof ProvDateTimeEncoded.Type;

/**
 * PROV timestamp decoded to `DateTime.Utc`.
 */
export const ProvDateTime = ProvDateTimeEncoded.pipe(
  S.decodeTo(S.DateTimeUtcFromString),
  S.annotate(
    $I.annote("ProvDateTime", {
      description: "A PROV timestamp decoded into an Effect DateTime.Utc value.",
    })
  )
);

/**
 * Type for {@link ProvDateTime}.
 */
export type ProvDateTime = typeof ProvDateTime.Type;

const OptionalTypeField = S.OptionFromOptionalKey(S.Union([S.String, S.Array(S.String)])).annotate(
  $I.annote("OptionalTypeField", {
    description: "A free-form `type` field preserved for GeoJSON and other open-world compatibility.",
  })
);

/**
 * JSON link structure referenced by entity `links`.
 */
export class ExternalLink extends S.Class<ExternalLink, Brand.Brand<"ProvExternalLink">>($I`ExternalLink`)(
  {
    href: UriReference,
    rel: LinkRelation,
    anchor: S.OptionFromOptionalKey(S.String),
    type: S.OptionFromOptionalKey(S.String),
    hreflang: S.OptionFromOptionalKey(S.String),
    title: S.OptionFromOptionalKey(S.String),
    length: S.OptionFromOptionalKey(S.Int),
  },
  $I.annote("ExternalLink", {
    description: "The OGC JSON link structure used by the upstream PROV entity schema.",
  })
) {}

const EntityTypeLiteral = LiteralKit([
  "Entity",
  "Bundle",
  "Plan",
  "prov:Entity",
  "prov:Bundle",
  "prov:Plan",
] as const);

/**
 * Entity type literal or array containing an entity class literal.
 */
export const EntityTypes = literalOrArrayContaining(
  "EntityTypes",
  "A canonical PROV entity class literal or an array containing one.",
  EntityTypeLiteral
).pipe(S.brand("ProvEntityTypes"));

/**
 * Type for {@link EntityTypes}.
 */
export type EntityTypes = typeof EntityTypes.Type;

const ActivityTypeLiteral = LiteralKit(["Activity", "prov:Activity"] as const);

/**
 * Activity type literal or array containing an activity class literal.
 */
export const ActivityTypes = literalOrArrayContaining(
  "ActivityTypes",
  "A canonical PROV activity class literal or an array containing one.",
  ActivityTypeLiteral
).pipe(S.brand("ProvActivityTypes"));

/**
 * Type for {@link ActivityTypes}.
 */
export type ActivityTypes = typeof ActivityTypes.Type;

const AgentTypeLiteral = LiteralKit([
  "Agent",
  "Organization",
  "Person",
  "SoftwareAgent",
  "SoftwareDescription",
  "DirectQueryService",
  "prov:Agent",
  "prov:Organization",
  "prov:Person",
  "prov:SoftwareAgent",
  "prov:SoftwareDescription",
  "prov:DirectQueryService",
] as const);

/**
 * Agent type literal or array containing an agent class literal.
 */
export const AgentTypes = literalOrArrayContaining(
  "AgentTypes",
  "A canonical PROV agent class literal or an array containing one.",
  AgentTypeLiteral
).pipe(S.brand("ProvAgentTypes"));

/**
 * Type for {@link AgentTypes}.
 */
export type AgentTypes = typeof AgentTypes.Type;

const CollectionTypeLiteral = LiteralKit(["Collection", "EmptyCollection"] as const);

const UsageType = literalOrArrayContaining(
  "UsageType",
  "A qualified usage type literal or array containing one.",
  LiteralKit(["Usage", "prov:Usage"] as const)
);

const GenerationType = literalOrArrayContaining(
  "GenerationType",
  "A qualified generation type literal or array containing one.",
  LiteralKit(["Generation"] as const)
);

const InvalidationType = literalOrArrayContaining(
  "InvalidationType",
  "A qualified invalidation type literal or array containing one.",
  LiteralKit(["Invalidation"] as const)
);

const CommunicationType = literalOrArrayContaining(
  "CommunicationType",
  "A qualified communication type literal or array containing one.",
  LiteralKit(["Communication"] as const)
);

const DerivationType = literalOrArrayContaining(
  "DerivationType",
  "A qualified derivation type literal or array containing one.",
  LiteralKit(["Derivation"] as const)
);

const DelegationType = literalOrArrayContaining(
  "DelegationType",
  "A qualified delegation type literal or array containing one.",
  LiteralKit(["Delegation"] as const)
);

const AttributionType = literalOrArrayContaining(
  "AttributionType",
  "A qualified attribution type literal or array containing one.",
  LiteralKit(["Attribution"] as const)
);

const AssociationType = literalOrArrayContaining(
  "AssociationType",
  "A qualified association type literal or array containing one.",
  LiteralKit(["Association"] as const)
);

const StartType = literalOrArrayContaining(
  "StartType",
  "A qualified start type literal or array containing one.",
  LiteralKit(["Start"] as const)
);

const EndType = literalOrArrayContaining(
  "EndType",
  "A qualified end type literal or array containing one.",
  LiteralKit(["End"] as const)
);

/**
 * OGC helper for object-reference-or-object values.
 */
export const OneOrMoreObjectRef = S.Union([ObjectRef, S.Array(ObjectRef), OpenObject]).annotate(
  $I.annote("OneOrMoreObjectRef", {
    description: "An OGC helper value that may be a single object reference, an array of references, or an open object.",
  })
);

/**
 * Type for {@link OneOrMoreObjectRef}.
 */
export type OneOrMoreObjectRef = typeof OneOrMoreObjectRef.Type;

/**
 * Qualified influence between provenance nodes.
 */
export class Influence extends S.Class<Influence, Brand.Brand<"ProvInfluence">>($I`Influence`)(
  S.Struct({
    id: S.OptionFromOptionalKey(ObjectRef),
    influencer: S.OptionFromOptionalKey(
      S.Union([
        S.suspend(() => OneOrMoreActivitiesOrRefIds),
        S.suspend(() => OneOrMoreEntitiesOrRefIds),
        S.suspend(() => OneOrMoreAgentsOrRefIds),
      ])
    ),
    entity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreEntitiesOrRefIds)),
    activity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreActivitiesOrRefIds)),
    agent: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreAgentsOrRefIds)),
  }).check(
    S.makeFilterGroup(
      [
        S.makeFilter(
          ({ influencer, entity, activity, agent }) =>
            hasSomeOption(influencer) || hasSomeOption(entity) || hasSomeOption(activity) || hasSomeOption(agent),
          {
            identifier: $I`InfluenceTargetCheck`,
            title: "Influence Target",
            description: "An influence must identify at least one influencer target.",
            message: "Influence objects must define at least one of influencer, entity, activity, or agent",
          }
        ),
      ],
      {
        identifier: $I`InfluenceChecks`,
        title: "Influence",
        description: "Checks for generic qualified influence objects.",
      }
    )
  ),
  $I.annote("Influence", {
    description: "A generic qualified PROV influence used by the top-level influenced mixin.",
  })
) {}

const InfluencedFields = {
  wasInfluencedBy: S.OptionFromOptionalKey(
    S.Union([
      S.suspend(() => OneOrMoreActivitiesOrRefIds),
      S.suspend(() => OneOrMoreEntitiesOrRefIds),
      S.suspend(() => OneOrMoreAgentsOrRefIds),
    ])
  ),
  qualifiedInfluence: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedInfluenceReference",
      "A qualified influence value or reference.",
      () => Influence
    )
  ),
} as const;

const ActivityInfluenceFields = {
  id: S.OptionFromOptionalKey(ObjectRef),
  atTime: S.OptionFromOptionalKey(ProvDateTime),
  hadRole: S.OptionFromOptionalKey(OneOrMoreObjectRef),
  influencer: S.OptionFromOptionalKey(OneOrMoreObjectRef),
  hadActivity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreActivitiesOrRefIds)),
  activity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreActivitiesOrRefIds)),
} as const;

/**
 * Qualified activity influence base structure.
 */
export class ActivityInfluence extends S.Class<ActivityInfluence, Brand.Brand<"ProvActivityInfluence">>(
  $I`ActivityInfluence`
)(
  {
    ...ActivityInfluenceFields,
  },
  $I.annote("ActivityInfluence", {
    description: "A qualified activity influence record shared by generation, invalidation, and communication.",
  })
) {}

/**
 * Qualified usage relation.
 */
export class Usage extends S.Class<Usage, Brand.Brand<"ProvUsage">>($I`Usage`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(UsageType),
    atTime: S.OptionFromOptionalKey(ProvDateTime),
    entity: S.suspend(() => OneOrMoreEntitiesOrRefIds),
  },
  $I.annote("Usage", {
    description: "A qualified usage relation between an activity and one or more entities.",
  })
) {}

/**
 * Qualified generation relation.
 */
export class Generation extends S.Class<Generation, Brand.Brand<"ProvGeneration">>($I`Generation`)(
  {
    ...ActivityInfluenceFields,
    type: GenerationType,
  },
  $I.annote("Generation", {
    description: "A qualified generation relation.",
  })
) {}

/**
 * Qualified invalidation relation.
 */
export class Invalidation extends S.Class<Invalidation, Brand.Brand<"ProvInvalidation">>($I`Invalidation`)(
  {
    ...ActivityInfluenceFields,
    type: InvalidationType,
  },
  $I.annote("Invalidation", {
    description: "A qualified invalidation relation.",
  })
) {}

/**
 * Qualified communication relation.
 */
export class Communication extends S.Class<Communication, Brand.Brand<"ProvCommunication">>($I`Communication`)(
  {
    ...ActivityInfluenceFields,
    type: CommunicationType,
  },
  $I.annote("Communication", {
    description: "A qualified communication relation between activities.",
  })
) {}

/**
 * Qualified derivation relation.
 */
export class Derivation extends S.Class<Derivation, Brand.Brand<"ProvDerivation">>($I`Derivation`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(DerivationType),
    hadGeneration: S.OptionFromOptionalKey(
      objectRefOrInline("HadGenerationReference", "A qualified generation reference.", (): SyncSchema => Generation)
    ),
    hadActivity: S.OptionFromOptionalKey(
      objectRefOrInline("HadActivityReference", "A generating activity reference.", (): SyncSchema => Activity)
    ),
    hadUsage: S.OptionFromOptionalKey(
      objectRefOrInline("HadUsageReference", "A qualified usage reference.", (): SyncSchema => Usage)
    ),
    entity: objectRefOrInline("DerivedEntityReference", "A derived entity or entity reference.", (): SyncSchema => Entity),
  },
  $I.annote("Derivation", {
    description: "A qualified derivation relation.",
  })
) {}

/**
 * Qualified delegation relation.
 */
export class Delegation extends S.Class<Delegation, Brand.Brand<"ProvDelegation">>($I`Delegation`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(DelegationType),
    agent: S.OptionFromOptionalKey(
      objectRefOrInline("DelegationAgentReference", "An agent or agent reference.", (): SyncSchema => Agent)
    ),
    hadActivity: S.OptionFromOptionalKey(
      objectRefOrInline("DelegationActivityReference", "A delegated activity or activity reference.", (): SyncSchema => Activity)
    ),
  },
  $I.annote("Delegation", {
    description: "A qualified delegation relation.",
  })
) {}

/**
 * Qualified attribution relation.
 */
export class Attribution extends S.Class<Attribution, Brand.Brand<"ProvAttribution">>($I`Attribution`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(AttributionType),
    agent: S.OptionFromOptionalKey(
      objectRefOrInline("AttributionAgentReference", "An attributing agent or agent reference.", (): SyncSchema => Agent)
    ),
  },
  $I.annote("Attribution", {
    description: "A qualified attribution relation.",
  })
) {}

const StartOrEndFields = {
  id: S.OptionFromOptionalKey(ObjectRef),
  atTime: ProvDateTime,
  entity: S.OptionFromOptionalKey(
    objectRefOrInline("StartOrEndEntityReference", "An entity or entity reference.", (): SyncSchema => Entity)
  ),
  hadActivity: S.OptionFromOptionalKey(
    objectRefOrInline("StartOrEndActivityReference", "An activity or activity reference.", (): SyncSchema => Activity)
  ),
} as const;

/**
 * Qualified start relation.
 */
export class Start extends S.Class<Start, Brand.Brand<"ProvStart">>($I`Start`)(
  {
    ...StartOrEndFields,
    type: S.OptionFromOptionalKey(StartType),
  },
  $I.annote("Start", {
    description: "A qualified start relation.",
  })
) {}

/**
 * Qualified end relation.
 */
export class End extends S.Class<End, Brand.Brand<"ProvEnd">>($I`End`)(
  {
    ...StartOrEndFields,
    type: S.OptionFromOptionalKey(EndType),
  },
  $I.annote("End", {
    description: "A qualified end relation.",
  })
) {}

/**
 * Qualified association relation.
 */
export class Association extends S.Class<Association, Brand.Brand<"ProvAssociation">>($I`Association`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(AssociationType),
    agent: S.OptionFromOptionalKey(
      objectRefOrInline("AssociationAgentReference", "An associated agent or agent reference.", (): SyncSchema => Agent)
    ),
    hadRole: S.OptionFromOptionalKey(OneOrMoreObjectRef),
    hadPlan: S.OptionFromOptionalKey(OneOrMoreObjectRef),
  },
  $I.annote("Association", {
    description: "A qualified association relation.",
  })
) {}

/**
 * Activity or reference or array of either.
 */
export const OneOrMoreActivitiesOrRefIds = objectRefOrInlineOrMany(
  "OneOrMoreActivitiesOrRefIds",
  "A single activity reference, a nested activity, or an array mixing both.",
  (): SyncSchema => Activity
);

/**
 * Type for {@link OneOrMoreActivitiesOrRefIds}.
 */
export type OneOrMoreActivitiesOrRefIds = typeof OneOrMoreActivitiesOrRefIds.Type;

/**
 * Entity or reference or array of either.
 */
export const OneOrMoreEntitiesOrRefIds = objectRefOrInlineOrMany(
  "OneOrMoreEntitiesOrRefIds",
  "A single entity reference, a nested entity, or an array mixing both.",
  (): SyncSchema => Entity
);

/**
 * Type for {@link OneOrMoreEntitiesOrRefIds}.
 */
export type OneOrMoreEntitiesOrRefIds = typeof OneOrMoreEntitiesOrRefIds.Type;

/**
 * Agent or reference or array of either.
 */
export const OneOrMoreAgentsOrRefIds = objectRefOrInlineOrMany(
  "OneOrMoreAgentsOrRefIds",
  "A single agent reference, a nested agent, or an array mixing both.",
  (): SyncSchema => Agent
);

/**
 * Type for {@link OneOrMoreAgentsOrRefIds}.
 */
export type OneOrMoreAgentsOrRefIds = typeof OneOrMoreAgentsOrRefIds.Type;

const activityTypeDisallowedLiterals = [
  ...EntityTypeLiteral.Options,
  ...CollectionTypeLiteral.Options,
  ...AgentTypeLiteral.Options,
] as const;

const entityTypeDisallowedLiterals = [...ActivityTypeLiteral.Options, ...AgentTypeLiteral.Options] as const;
const agentTypeDisallowedLiterals = [
  ...EntityTypeLiteral.Options,
  ...CollectionTypeLiteral.Options,
  ...ActivityTypeLiteral.Options,
] as const;

const EntityFields = {
  id: ObjectRef,
  provType: S.OptionFromOptionalKey(EntityTypes),
  "prov:type": S.OptionFromOptionalKey(EntityTypes),
  type: OptionalTypeField,
  featureType: S.OptionFromOptionalKey(OneOrMoreObjectRef),
  entityType: S.OptionFromOptionalKey(OneOrMoreObjectRef),
  has_provenance: S.OptionFromOptionalKey(S.suspend((): SyncSchema => Prov)),
  wasGeneratedBy: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreActivitiesOrRefIds)),
  wasAttributedTo: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreAgentsOrRefIds)),
  wasDerivedFrom: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  alternateOf: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  hadPrimarySource: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  specializationOf: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  wasInvalidatedBy: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreActivitiesOrRefIds)),
  wasQuotedFrom: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  wasRevisionOf: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  atLocation: S.OptionFromOptionalKey(ObjectRef),
  links: S.OptionFromOptionalKey(S.Array(ExternalLink)),
  qualifiedGeneration: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedGenerationReference",
      "A qualified generation relation or reference.",
      (): SyncSchema => Generation
    )
  ),
  qualifiedInvalidation: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedInvalidationReference",
      "A qualified invalidation relation or reference.",
      (): SyncSchema => Invalidation
    )
  ),
  qualifiedDerivation: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedDerivationReference",
      "A qualified derivation relation or reference.",
      (): SyncSchema => Derivation
    )
  ),
  qualifiedAttribution: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedAttributionReference",
      "A qualified attribution relation or reference.",
      (): SyncSchema => Attribution
    )
  ),
  hadMember: S.OptionFromOptionalKey(S.Array(S.suspend((): SyncSchema => Entity))),
  ...InfluencedFields,
  activityType: S.optionalKey(S.Never),
  endedAtTime: S.optionalKey(S.Never),
  startedAtTime: S.optionalKey(S.Never),
  wasAssociatedWith: S.optionalKey(S.Never),
  wasInformedBy: S.optionalKey(S.Never),
  used: S.optionalKey(S.Never),
  wasStartedBy: S.optionalKey(S.Never),
  wasEndedBy: S.optionalKey(S.Never),
  invalidated: S.optionalKey(S.Never),
  generated: S.optionalKey(S.Never),
  qualifiedUsage: S.optionalKey(S.Never),
  qualifiedCommunication: S.optionalKey(S.Never),
  qualifiedStart: S.optionalKey(S.Never),
  qualifiedEnd: S.optionalKey(S.Never),
  qualifiedAssociation: S.optionalKey(S.Never),
  agentType: S.optionalKey(S.Never),
  actedOnBehalfOf: S.optionalKey(S.Never),
  qualifiedDelegation: S.optionalKey(S.Never),
} as const;

const EntityShape = S.Struct(EntityFields);
type EntityValue = typeof EntityShape.Type;
const hasEntityGeneration = (value: unknown): value is Pick<EntityValue, "wasGeneratedBy"> =>
  P.isObject(value) && "wasGeneratedBy" in value;

const entityChecks = S.makeFilterGroup<EntityValue>(
  [
    S.makeFilter<EntityValue>(
      (value) => !typeFieldHasAnyLiteral(value.type, entityTypeDisallowedLiterals),
      {
        identifier: $I`EntityForeignTypeCheck`,
        title: "Entity Foreign Type",
        description: "Entity objects must not declare explicit activity or agent type literals.",
        message: "Entity objects must not carry explicit activity or agent type markers",
      }
    ),
    S.makeFilter<EntityValue>(
      (value) =>
        pipe(
          value.hadMember,
          O.match({
            onNone: () => !typeFieldHasAnyLiteral(value.type, CollectionTypeLiteral.Options),
            onSome: (members) => {
              const isCollection = typeFieldHasAnyLiteral(value.type, ["Collection"]);
              const isEmptyCollection = typeFieldHasAnyLiteral(value.type, ["EmptyCollection"]);
              return (isCollection && A.isReadonlyArrayNonEmpty(members)) || (isEmptyCollection && A.isReadonlyArrayEmpty(members));
            },
          })
        ),
      {
        identifier: $I`EntityCollectionConsistencyCheck`,
        title: "Entity Collection Consistency",
        description: "Entity collection markers and hadMember must agree with PROV collection semantics.",
        message: "Entity collection fields must align with Collection or EmptyCollection semantics",
      }
    ),
  ],
  {
    identifier: $I`EntityChecks`,
    title: "Entity",
    description: "Checks for PROV entity objects.",
  }
);

/**
 * PROV entity object.
 */
export class Entity extends S.Class<Entity, Brand.Brand<"ProvEntity">>($I`Entity`)(
  EntityShape.check(entityChecks),
  $I.annote("Entity", {
    description: "A PROV entity object supporting nested provenance chains and qualified relations.",
  })
) {}

const ActivityFields = {
  id: S.OptionFromOptionalKey(ObjectRef),
  provType: S.OptionFromOptionalKey(ActivityTypes),
  "prov:type": S.OptionFromOptionalKey(ActivityTypes),
  type: OptionalTypeField,
  activityType: S.OptionFromOptionalKey(OneOrMoreObjectRef),
  startedAtTime: S.OptionFromOptionalKey(ProvDateTime),
  endedAtTime: S.OptionFromOptionalKey(ProvDateTime),
  wasAssociatedWith: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreAgentsOrRefIds)),
  wasInformedBy: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreActivitiesOrRefIds)),
  used: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  wasStartedBy: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  wasEndedBy: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  invalidated: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  generated: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  atLocation: S.OptionFromOptionalKey(ObjectRef),
  qualifiedUsage: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany("QualifiedUsageReference", "A qualified usage relation or reference.", (): SyncSchema => Usage)
  ),
  qualifiedCommunication: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedCommunicationReference",
      "A qualified communication relation or reference.",
      (): SyncSchema => Communication
    )
  ),
  qualifiedStart: S.OptionFromOptionalKey(
    objectRefOrInline("QualifiedStartReference", "A qualified start relation or reference.", (): SyncSchema => Start)
  ),
  qualifiedEnd: S.OptionFromOptionalKey(
    objectRefOrInline("QualifiedEndReference", "A qualified end relation or reference.", (): SyncSchema => End)
  ),
  qualifiedAssociation: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedAssociationReference",
      "A qualified association relation or reference.",
      (): SyncSchema => Association
    )
  ),
  ...InfluencedFields,
  featureType: S.optionalKey(S.Never),
  entityType: S.optionalKey(S.Never),
  has_provenance: S.optionalKey(S.Never),
  wasGeneratedBy: S.optionalKey(S.Never),
  wasAttributedTo: S.optionalKey(S.Never),
  wasDerivedFrom: S.optionalKey(S.Never),
  alternateOf: S.optionalKey(S.Never),
  hadPrimarySource: S.optionalKey(S.Never),
  specializationOf: S.optionalKey(S.Never),
  wasInvalidatedBy: S.optionalKey(S.Never),
  wasQuotedFrom: S.optionalKey(S.Never),
  wasRevisionOf: S.optionalKey(S.Never),
  qualifiedGeneration: S.optionalKey(S.Never),
  qualifiedInvalidation: S.optionalKey(S.Never),
  qualifiedDerivation: S.optionalKey(S.Never),
  qualifiedAttribution: S.optionalKey(S.Never),
  hadMember: S.optionalKey(S.Never),
  agentType: S.optionalKey(S.Never),
  actedOnBehalfOf: S.optionalKey(S.Never),
  qualifiedDelegation: S.optionalKey(S.Never),
} as const;

const ActivityShape = S.Struct(ActivityFields);
type ActivityValue = typeof ActivityShape.Type;
const hasActivityEndTime = (value: unknown): value is Pick<ActivityValue, "endedAtTime"> =>
  P.isObject(value) && "endedAtTime" in value;

const activityChecks = S.makeFilterGroup<ActivityValue>(
  [
    S.makeFilter<ActivityValue>(
      (value) => !typeFieldHasAnyLiteral(value.type, activityTypeDisallowedLiterals),
      {
        identifier: $I`ActivityForeignTypeCheck`,
        title: "Activity Foreign Type",
        description: "Activity objects must not declare explicit entity or agent type literals.",
        message: "Activity objects must not carry explicit entity or agent type markers",
      }
    ),
    S.makeFilter<ActivityValue>(
      (value) =>
        pipe(
          value.startedAtTime,
          O.match({
            onNone: () => true,
            onSome: (startedAt) =>
              pipe(
                value.endedAtTime,
                O.match({
                  onNone: () => true,
                  onSome: (endedAt) => DateTime.toEpochMillis(startedAt) <= DateTime.toEpochMillis(endedAt),
                })
              ),
          })
        ),
      {
        identifier: $I`ActivityTemporalOrderCheck`,
        title: "Activity Temporal Order",
        description: "Activities must not end before they start.",
        message: "Activities must not end before they start",
      }
    ),
    S.makeFilter<ActivityValue>(
      (value) =>
        pipe(
          value.endedAtTime,
          O.match({
            onNone: () => true,
            onSome: (endedAt) =>
              pipe(
                value.used,
                O.match({
                  onNone: () => true,
                  onSome: (usedEntities) =>
                    pipe(
                      toInlineValues(usedEntities, hasEntityGeneration),
                      A.every((entity) =>
                        pipe(
                          entity.wasGeneratedBy,
                          O.match({
                            onNone: () => true,
                            onSome: (generatedBy) =>
                              pipe(
                                toInlineValues(generatedBy, hasActivityEndTime),
                                A.every((activity) =>
                                  pipe(
                                    activity.endedAtTime,
                                    O.match({
                                      onNone: () => true,
                                      onSome: (generatedAt) =>
                                        DateTime.toEpochMillis(generatedAt) <= DateTime.toEpochMillis(endedAt),
                                    })
                                  )
                                )
                              ),
                          })
                        )
                      )
                    ),
                })
              ),
          })
        ),
      {
        identifier: $I`ActivitySequentialUsageCheck`,
        title: "Activity Sequential Usage",
        description: "Inline entities used by an activity must not be generated by later activities.",
        message: "Activities must not use inline entities generated by later activities",
      }
    ),
  ],
  {
    identifier: $I`ActivityChecks`,
    title: "Activity",
    description: "Checks for PROV activity objects.",
  }
);

/**
 * PROV activity object.
 */
export class Activity extends S.Class<Activity, Brand.Brand<"ProvActivity">>($I`Activity`)(
  ActivityShape.check(activityChecks),
  $I.annote("Activity", {
    description: "A PROV activity object with inline entity and agent relationships.",
  })
) {}

const AgentFields = {
  agentType: S.OptionFromOptionalKey(OneOrMoreObjectRef),
  provType: S.OptionFromOptionalKey(AgentTypes),
  "prov:type": S.OptionFromOptionalKey(AgentTypes),
  type: OptionalTypeField,
  name: S.OptionFromOptionalKey(S.String),
  id: S.OptionFromOptionalKey(ObjectRef),
  actedOnBehalfOf: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreAgentsOrRefIds)),
  atLocation: S.OptionFromOptionalKey(ObjectRef),
  qualifiedDelegation: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedDelegationReference",
      "A qualified delegation relation or reference.",
      (): SyncSchema => Delegation
    )
  ),
  ...InfluencedFields,
  featureType: S.optionalKey(S.Never),
  entityType: S.optionalKey(S.Never),
  has_provenance: S.optionalKey(S.Never),
  wasGeneratedBy: S.optionalKey(S.Never),
  wasAttributedTo: S.optionalKey(S.Never),
  wasDerivedFrom: S.optionalKey(S.Never),
  alternateOf: S.optionalKey(S.Never),
  hadPrimarySource: S.optionalKey(S.Never),
  specializationOf: S.optionalKey(S.Never),
  wasInvalidatedBy: S.optionalKey(S.Never),
  wasQuotedFrom: S.optionalKey(S.Never),
  wasRevisionOf: S.optionalKey(S.Never),
  qualifiedGeneration: S.optionalKey(S.Never),
  qualifiedInvalidation: S.optionalKey(S.Never),
  qualifiedDerivation: S.optionalKey(S.Never),
  qualifiedAttribution: S.optionalKey(S.Never),
  hadMember: S.optionalKey(S.Never),
  activityType: S.optionalKey(S.Never),
  endedAtTime: S.optionalKey(S.Never),
  startedAtTime: S.optionalKey(S.Never),
  wasAssociatedWith: S.optionalKey(S.Never),
  wasInformedBy: S.optionalKey(S.Never),
  used: S.optionalKey(S.Never),
  wasStartedBy: S.optionalKey(S.Never),
  wasEndedBy: S.optionalKey(S.Never),
  invalidated: S.optionalKey(S.Never),
  generated: S.optionalKey(S.Never),
  qualifiedUsage: S.optionalKey(S.Never),
  qualifiedCommunication: S.optionalKey(S.Never),
  qualifiedStart: S.optionalKey(S.Never),
  qualifiedEnd: S.optionalKey(S.Never),
  qualifiedAssociation: S.optionalKey(S.Never),
} as const;

const AgentShape = S.Struct(AgentFields);
type AgentValue = typeof AgentShape.Type;

const agentChecks = S.makeFilterGroup<AgentValue>(
  [
    S.makeFilter<AgentValue>(
      (value) => !typeFieldHasAnyLiteral(value.type, agentTypeDisallowedLiterals),
      {
        identifier: $I`AgentForeignTypeCheck`,
        title: "Agent Foreign Type",
        description: "Agent objects must not declare explicit entity or activity type literals.",
        message: "Agent objects must not carry explicit entity or activity type markers",
      }
    ),
    S.makeFilter<AgentValue>(
      (value) => hasSomeOption(value.id) || hasSomeOption(value.name),
      {
        identifier: $I`AgentIdentityCheck`,
        title: "Agent Identity",
        description: "Agents must provide at least an id or a name.",
        message: "Agents must define at least one of id or name",
      }
    ),
  ],
  {
    identifier: $I`AgentChecks`,
    title: "Agent",
    description: "Checks for PROV agent objects.",
  }
);

/**
 * PROV agent object.
 */
export class Agent extends S.Class<Agent, Brand.Brand<"ProvAgent">>($I`Agent`)(
  AgentShape.check(agentChecks),
  $I.annote("Agent", {
    description: "A PROV agent object.",
  })
) {}

const entityRequirementChecks = S.makeFilterGroup<EntityValue>(
  [
    S.makeFilter<EntityValue>(
      (value) =>
        hasSomeOption(value.provType) ||
        hasSomeOption(value["prov:type"]) ||
        hasSomeOption(value.type) ||
        hasSomeOption(value.featureType) ||
        hasSomeOption(value.entityType) ||
        hasSomeOption(value.wasGeneratedBy) ||
        hasSomeOption(value.wasAttributedTo) ||
        hasSomeOption(value.wasDerivedFrom) ||
        hasSomeOption(value.has_provenance) ||
        hasSomeOption(value.hadMember),
      {
        identifier: $I`EntityRequirementCheck`,
        title: "Entity Requirements",
        description: "Root provenance entities must carry at least one explicit entity-defining field.",
        message: "Entity roots must define an entity type, entity relationship, or embedded provenance chain",
      }
    ),
  ],
  {
    identifier: $I`EntityRequirementChecks`,
    title: "Entity Requirements",
    description: "Checks for root-level entity classification.",
  }
);

/**
 * Root-level entity node used by the PROV graph array and top-level union.
 */
export class EntityWithRequirements extends S.Class<EntityWithRequirements, Brand.Brand<"ProvEntityWithRequirements">>(
  $I`EntityWithRequirements`
)(
  EntityShape.check(entityChecks).check(entityRequirementChecks),
  $I.annote("EntityWithRequirements", {
    description: "A root-level PROV entity that satisfies the upstream classification requirements.",
  })
) {}

const activityRequirementChecks = S.makeFilterGroup<ActivityValue>(
  [
    S.makeFilter<ActivityValue>(
      (value) =>
        hasSomeOption(value.provType) ||
        hasSomeOption(value["prov:type"]) ||
        hasSomeOption(value.type) ||
        hasSomeOption(value.activityType) ||
        hasSomeOption(value.used) ||
        hasSomeOption(value.wasInformedBy) ||
        hasSomeOption(value.startedAtTime) ||
        hasSomeOption(value.endedAtTime) ||
        hasSomeOption(value.wasAssociatedWith) ||
        hasSomeOption(value.wasStartedBy) ||
        hasSomeOption(value.wasEndedBy) ||
        hasSomeOption(value.invalidated) ||
        hasSomeOption(value.generated) ||
        hasSomeOption(value.qualifiedUsage) ||
        hasSomeOption(value.qualifiedCommunication) ||
        hasSomeOption(value.qualifiedStart) ||
        hasSomeOption(value.qualifiedEnd) ||
        hasSomeOption(value.qualifiedAssociation),
      {
        identifier: $I`ActivityRequirementCheck`,
        title: "Activity Requirements",
        description: "Root provenance activities must carry at least one explicit activity-defining field.",
        message: "Activity roots must define an activity type, activity relationship, or timestamp",
      }
    ),
  ],
  {
    identifier: $I`ActivityRequirementChecks`,
    title: "Activity Requirements",
    description: "Checks for root-level activity classification.",
  }
);

/**
 * Root-level activity node used by the PROV graph array and top-level union.
 */
export class ActivityWithRequirements extends S.Class<
  ActivityWithRequirements,
  Brand.Brand<"ProvActivityWithRequirements">
>($I`ActivityWithRequirements`)(
  ActivityShape.check(activityChecks).check(activityRequirementChecks),
  $I.annote("ActivityWithRequirements", {
    description: "A root-level PROV activity that satisfies the upstream classification requirements.",
  })
) {}

const agentRequirementChecks = S.makeFilterGroup<AgentValue>(
  [
    S.makeFilter<AgentValue>(
      (value) =>
        hasSomeOption(value.provType) ||
        hasSomeOption(value["prov:type"]) ||
        hasSomeOption(value.type) ||
        hasSomeOption(value.agentType) ||
        hasSomeOption(value.actedOnBehalfOf) ||
        hasSomeOption(value.qualifiedDelegation) ||
        hasSomeOption(value.name),
      {
        identifier: $I`AgentRequirementCheck`,
        title: "Agent Requirements",
        description: "Graph agents must carry at least one explicit agent-defining field.",
        message: "Graph agents must define an agent type, delegation, or name",
      }
    ),
  ],
  {
    identifier: $I`AgentRequirementChecks`,
    title: "Agent Requirements",
    description: "Checks for root-level agent classification.",
  }
);

/**
 * Root-level agent node used by the PROV graph array.
 */
export class AgentWithRequirements extends S.Class<AgentWithRequirements, Brand.Brand<"ProvAgentWithRequirements">>(
  $I`AgentWithRequirements`
)(
  AgentShape.check(agentChecks).check(agentRequirementChecks),
  $I.annote("AgentWithRequirements", {
    description: "A root-level PROV agent that satisfies the graph classification requirements.",
  })
) {}

/**
 * Provenance graph node accepted inside `has_provenance`.
 */
export const ProvNode = S.Union([EntityWithRequirements, AgentWithRequirements, ActivityWithRequirements]).annotate(
  $I.annote("ProvNode", {
    description: "A root-level provenance graph node accepted inside a provenance chain.",
  })
);

/**
 * Type for {@link ProvNode}.
 */
export type ProvNode = typeof ProvNode.Type;

/**
 * Embedded provenance graph.
 */
export const Prov = S.Array(ProvNode).annotate(
  $I.annote("Prov", {
    description: "An ordered provenance graph array made from entity, agent, and activity roots.",
  })
);

/**
 * Type for {@link Prov}.
 */
export type Prov = typeof Prov.Type;

/**
 * Top-level schema mirrored from the cloned PROV building block.
 *
 * The upstream root intentionally accepts standalone entities and activities,
 * plus provenance graph arrays, but not standalone agents.
 */
export const ProvO = S.Union([Prov, EntityWithRequirements, ActivityWithRequirements]).annotate(
  $I.annote("Prov0", {
    description: "The top-level PROV-O schema mirrored from the upstream building block.",
  })
);

/**
 * Type for {@link ProvO}.
 */
export type Prov0 = typeof ProvO.Type;
