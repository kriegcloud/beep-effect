import { $SchemaId } from "@beep/identity/packages";
import { type Brand, DateTime, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit, type LiteralKit as LiteralKitSchema } from "../../LiteralKit.ts";

const $I = $SchemaId.create("internal/ProvO/ProvO");
type SyncSchema = S.Top & { readonly DecodingServices: never };

const iriRegExp = /^\w+:\/*([^:<>{}|\\^`"\s/]+[^<>{}|\\^`"\s]*(?::[^:<>{}|\\^`"\s]+)?)?$/;
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
type TypeFieldValue = O.Option<string | ReadonlyArray<string>>;

const hasCanonicalTypeMarker = (
  value: {
    readonly provType: TypeFieldValue;
    readonly "prov:type": TypeFieldValue;
    readonly type: TypeFieldValue;
  },
  literals: ReadonlyArray<string>
): boolean =>
  typeFieldHasAnyLiteral(value.provType, literals) ||
  typeFieldHasAnyLiteral(value["prov:type"], literals) ||
  typeFieldHasAnyLiteral(value.type, literals);

const makeRequiredTypeCheck = <
  A extends {
    readonly provType: TypeFieldValue;
    readonly "prov:type": TypeFieldValue;
    readonly type: TypeFieldValue;
  },
>(
  identifier: string,
  title: string,
  description: string,
  literals: ReadonlyArray<string>,
  message: string
) =>
  S.makeFilter<A>((value) => hasCanonicalTypeMarker(value, literals), {
    identifier: $I.create(identifier).make("RequiredTypeCheck"),
    title,
    description,
    message,
  });

const toInlineValues = <B>(value: unknown, isInline: (value: unknown) => value is B): ReadonlyArray<B> => {
  if (P.isString(value)) {
    return [];
  }

  if (globalThis.Array.isArray(value)) {
    return pipe(value, A.filter(isInline));
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
  S.Union([literalKit, S.Array(S.String).check(arrayContainsCanonicalLiteral(name, description, literalKit))]).annotate(
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

const OpenObject = S.Record(S.String, S.Unknown)
  .check(openObjectChecks)
  .annotate(
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

const LocationClassType = literalOrArrayContaining(
  "LocationClassType",
  "A canonical PROV location class literal or an array containing one.",
  LiteralKit(["Location", "prov:Location"] as const)
);

const RoleClassType = literalOrArrayContaining(
  "RoleClassType",
  "A canonical PROV role class literal or an array containing one.",
  LiteralKit(["Role", "prov:Role"] as const)
);

const LocationFields = {
  id: S.OptionFromOptionalKey(ObjectRef),
  provType: S.OptionFromOptionalKey(LocationClassType),
  "prov:type": S.OptionFromOptionalKey(LocationClassType),
  type: OptionalTypeField,
} as const;

class LocationShape extends S.Class<LocationShape>($I`LocationShape`)(
  LocationFields,
  $I.annote("LocationShape", {
    description: "Base location fields before PROV canonical location checks are applied.",
  })
) {}

/**
 * PROV location value used by `atLocation`.
 */
export class Location extends S.Class<Location, Brand.Brand<"ProvLocation">>($I`Location`)(
  LocationShape.check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<{
        readonly provType: TypeFieldValue;
        readonly "prov:type": TypeFieldValue;
        readonly type: TypeFieldValue;
      }>(
        "Location",
        "Location Type",
        "Inline PROV locations must carry a canonical location class marker.",
        ["Location", "prov:Location"],
        "Location values must carry a canonical Location type marker"
      ),
    ])
  ),
  $I.annote("Location", {
    description: "A PROV location value used by entity, activity, agent, and instantaneous event location properties.",
  })
) {}

/**
 * PROV role value used by `hadRole`.
 */
class RoleShape extends S.Class<RoleShape>($I`RoleShape`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    provType: S.OptionFromOptionalKey(RoleClassType),
    "prov:type": S.OptionFromOptionalKey(RoleClassType),
    type: OptionalTypeField,
  },
  $I.annote("RoleShape", {
    description: "Base role fields before PROV canonical role checks are applied.",
  })
) {}

/**
 * PROV role value used by `hadRole`.
 */
export class Role extends S.Class<Role, Brand.Brand<"ProvRole">>($I`Role`)(
  RoleShape.check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<{
        readonly provType: TypeFieldValue;
        readonly "prov:type": TypeFieldValue;
        readonly type: TypeFieldValue;
      }>(
        "Role",
        "Role Type",
        "Inline PROV roles must carry a canonical role class marker.",
        ["Role", "prov:Role"],
        "Role values must carry a canonical Role type marker"
      ),
    ])
  ),
  $I.annote("Role", {
    description: "A PROV role value used to qualify usage, generation, attribution, association, and delegation.",
  })
) {}

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

/**
 * PROV literal value carried by `prov:value`.
 */
export const ProvValue = S.Union([S.String, S.Number, S.Boolean, S.Null]).annotate(
  $I.annote("ProvValue", {
    description: "A JSON scalar value used to represent `prov:value` literals.",
  })
);

/**
 * Type for {@link ProvValue}.
 */
export type ProvValue = typeof ProvValue.Type;

const EntityTypeLiteral = LiteralKit([
  "Entity",
  "Bundle",
  "Plan",
  "Collection",
  "EmptyCollection",
  "prov:Entity",
  "prov:Bundle",
  "prov:Plan",
  "prov:Collection",
  "prov:EmptyCollection",
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

const CollectionTypeLiteral = LiteralKit([
  "Collection",
  "EmptyCollection",
  "prov:Collection",
  "prov:EmptyCollection",
] as const);

const InstantaneousEventType = literalOrArrayContaining(
  "InstantaneousEventType",
  "A canonical PROV instantaneous event class literal or an array containing one.",
  LiteralKit(["InstantaneousEvent", "prov:InstantaneousEvent"] as const)
);

const EntityInfluenceType = literalOrArrayContaining(
  "EntityInfluenceType",
  "A canonical PROV entity influence class literal or an array containing one.",
  LiteralKit(["EntityInfluence", "prov:EntityInfluence"] as const)
);

const AgentInfluenceType = literalOrArrayContaining(
  "AgentInfluenceType",
  "A canonical PROV agent influence class literal or an array containing one.",
  LiteralKit(["AgentInfluence", "prov:AgentInfluence"] as const)
);

const UsageType = literalOrArrayContaining(
  "UsageType",
  "A qualified usage type literal or array containing one.",
  LiteralKit(["Usage", "prov:Usage"] as const)
);

const GenerationType = literalOrArrayContaining(
  "GenerationType",
  "A qualified generation type literal or array containing one.",
  LiteralKit(["Generation", "prov:Generation"] as const)
);

const InvalidationType = literalOrArrayContaining(
  "InvalidationType",
  "A qualified invalidation type literal or array containing one.",
  LiteralKit(["Invalidation", "prov:Invalidation"] as const)
);

const CommunicationType = literalOrArrayContaining(
  "CommunicationType",
  "A qualified communication type literal or array containing one.",
  LiteralKit(["Communication", "prov:Communication"] as const)
);

const DerivationType = literalOrArrayContaining(
  "DerivationType",
  "A qualified derivation type literal or array containing one.",
  LiteralKit(["Derivation", "prov:Derivation"] as const)
);

const PrimarySourceType = literalOrArrayContaining(
  "PrimarySourceType",
  "A qualified primary source type literal or array containing one.",
  LiteralKit(["PrimarySource", "prov:PrimarySource"] as const)
);

const QuotationType = literalOrArrayContaining(
  "QuotationType",
  "A qualified quotation type literal or array containing one.",
  LiteralKit(["Quotation", "prov:Quotation"] as const)
);

const RevisionType = literalOrArrayContaining(
  "RevisionType",
  "A qualified revision type literal or array containing one.",
  LiteralKit(["Revision", "prov:Revision"] as const)
);

const DelegationType = literalOrArrayContaining(
  "DelegationType",
  "A qualified delegation type literal or array containing one.",
  LiteralKit(["Delegation", "prov:Delegation"] as const)
);

const AttributionType = literalOrArrayContaining(
  "AttributionType",
  "A qualified attribution type literal or array containing one.",
  LiteralKit(["Attribution", "prov:Attribution"] as const)
);

const AssociationType = literalOrArrayContaining(
  "AssociationType",
  "A qualified association type literal or array containing one.",
  LiteralKit(["Association", "prov:Association"] as const)
);

const StartType = literalOrArrayContaining(
  "StartType",
  "A qualified start type literal or array containing one.",
  LiteralKit(["Start", "prov:Start"] as const)
);

const EndType = literalOrArrayContaining(
  "EndType",
  "A qualified end type literal or array containing one.",
  LiteralKit(["End", "prov:End"] as const)
);

/**
 * OGC helper for object-reference-or-object values.
 */
export const OneOrMoreObjectRef = S.Union([ObjectRef, S.Array(ObjectRef), OpenObject]).annotate(
  $I.annote("OneOrMoreObjectRef", {
    description:
      "An OGC helper value that may be a single object reference, an array of references, or an open object.",
  })
);

/**
 * Type for {@link OneOrMoreObjectRef}.
 */
export type OneOrMoreObjectRef = typeof OneOrMoreObjectRef.Type;

/**
 * Location or reference used by `atLocation`.
 */
export const LocationReference = objectRefOrInline(
  "LocationReference",
  "A PROV location value or location reference.",
  (): SyncSchema => Location
);

/**
 * Role or reference or array of either.
 */
export const OneOrMoreRolesOrRefIds = objectRefOrInlineOrMany(
  "OneOrMoreRolesOrRefIds",
  "A single role reference, a nested role, or an array mixing both.",
  (): SyncSchema => Role
);

/**
 * Type for {@link OneOrMoreRolesOrRefIds}.
 */
export type OneOrMoreRolesOrRefIds = typeof OneOrMoreRolesOrRefIds.Type;

/**
 * Qualified influence between provenance nodes.
 */
const InfluenceFields = {
  id: S.OptionFromOptionalKey(ObjectRef),
  influenced: S.OptionFromOptionalKey(
    S.Union([
      S.suspend(() => OneOrMoreActivitiesOrRefIds),
      S.suspend(() => OneOrMoreEntitiesOrRefIds),
      S.suspend(() => OneOrMoreAgentsOrRefIds),
    ])
  ),
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
  hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
  hadActivity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreActivitiesOrRefIds)),
} as const;

class InfluenceShape extends S.Class<InfluenceShape>($I`InfluenceShape`)(
  InfluenceFields,
  $I.annote("InfluenceShape", {
    description: "Base qualified influence fields before generic influence invariants are enforced.",
  })
) {}

/**
 * Qualified influence between provenance nodes.
 */
export class Influence extends S.Class<Influence, Brand.Brand<"ProvInfluence">>($I`Influence`)(
  InfluenceShape.check(
    S.makeFilterGroup(
      [
        S.makeFilter(
          ({ influenced, influencer, entity, activity, agent }) =>
            hasSomeOption(influenced) ||
            hasSomeOption(influencer) ||
            hasSomeOption(entity) ||
            hasSomeOption(activity) ||
            hasSomeOption(agent),
          {
            identifier: $I`InfluenceTargetCheck`,
            title: "Influence Target",
            description: "An influence must identify an influenced target or an influencer.",
            message: "Influence objects must define at least one of influenced, influencer, entity, activity, or agent",
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
    objectRefOrInlineOrMany("QualifiedInfluenceReference", "A qualified influence value or reference.", () => Influence)
  ),
} as const;

const ActivityInfluenceFields = {
  id: S.OptionFromOptionalKey(ObjectRef),
  hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
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
 * Qualified entity influence base structure.
 */
export class EntityInfluence extends S.Class<EntityInfluence, Brand.Brand<"ProvEntityInfluence">>($I`EntityInfluence`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(EntityInfluenceType),
    entity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreEntitiesOrRefIds)),
    influencer: S.OptionFromOptionalKey(OneOrMoreObjectRef),
    hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
    hadActivity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreActivitiesOrRefIds)),
  },
  $I.annote("EntityInfluence", {
    description: "A qualified entity influence record used by entity-derived qualified relations.",
  })
) {}

/**
 * Qualified agent influence base structure.
 */
export class AgentInfluence extends S.Class<AgentInfluence, Brand.Brand<"ProvAgentInfluence">>($I`AgentInfluence`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(AgentInfluenceType),
    agent: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreAgentsOrRefIds)),
    influencer: S.OptionFromOptionalKey(OneOrMoreObjectRef),
    hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
    hadActivity: S.OptionFromOptionalKey(S.suspend(() => OneOrMoreActivitiesOrRefIds)),
  },
  $I.annote("AgentInfluence", {
    description: "A qualified agent influence record used by attribution, association, and delegation.",
  })
) {}

/**
 * Qualified instantaneous event base structure.
 */
export class InstantaneousEvent extends S.Class<InstantaneousEvent, Brand.Brand<"ProvInstantaneousEvent">>(
  $I`InstantaneousEvent`
)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(InstantaneousEventType),
    atTime: S.OptionFromOptionalKey(ProvDateTime),
    atLocation: S.OptionFromOptionalKey(LocationReference),
  },
  $I.annote("InstantaneousEvent", {
    description: "A PROV instantaneous event that may be used to qualify generation, invalidation, start, or end.",
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
    hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
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
    atTime: S.OptionFromOptionalKey(ProvDateTime),
    atLocation: S.OptionFromOptionalKey(LocationReference),
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
    atTime: S.OptionFromOptionalKey(ProvDateTime),
    atLocation: S.OptionFromOptionalKey(LocationReference),
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
    entity: objectRefOrInline(
      "DerivedEntityReference",
      "A derived entity or entity reference.",
      (): SyncSchema => Entity
    ),
  },
  $I.annote("Derivation", {
    description: "A qualified derivation relation.",
  })
) {}

/**
 * Qualified primary source relation.
 */
export class PrimarySource extends S.Class<PrimarySource, Brand.Brand<"ProvPrimarySource">>($I`PrimarySource`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(PrimarySourceType),
    hadGeneration: S.OptionFromOptionalKey(
      objectRefOrInline(
        "PrimarySourceGenerationReference",
        "A qualified generation reference.",
        (): SyncSchema => Generation
      )
    ),
    hadActivity: S.OptionFromOptionalKey(
      objectRefOrInline(
        "PrimarySourceActivityReference",
        "A generating activity reference.",
        (): SyncSchema => Activity
      )
    ),
    hadUsage: S.OptionFromOptionalKey(
      objectRefOrInline("PrimarySourceUsageReference", "A qualified usage reference.", (): SyncSchema => Usage)
    ),
    entity: objectRefOrInline(
      "PrimarySourceEntityReference",
      "A primary source entity or entity reference.",
      (): SyncSchema => Entity
    ),
  },
  $I.annote("PrimarySource", {
    description: "A qualified primary source relation represented as a typed derivation.",
  })
) {}

/**
 * Qualified quotation relation.
 */
export class Quotation extends S.Class<Quotation, Brand.Brand<"ProvQuotation">>($I`Quotation`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(QuotationType),
    hadGeneration: S.OptionFromOptionalKey(
      objectRefOrInline(
        "QuotationGenerationReference",
        "A qualified generation reference.",
        (): SyncSchema => Generation
      )
    ),
    hadActivity: S.OptionFromOptionalKey(
      objectRefOrInline("QuotationActivityReference", "A generating activity reference.", (): SyncSchema => Activity)
    ),
    hadUsage: S.OptionFromOptionalKey(
      objectRefOrInline("QuotationUsageReference", "A qualified usage reference.", (): SyncSchema => Usage)
    ),
    entity: objectRefOrInline(
      "QuotationEntityReference",
      "A quoted entity or entity reference.",
      (): SyncSchema => Entity
    ),
  },
  $I.annote("Quotation", {
    description: "A qualified quotation relation represented as a typed derivation.",
  })
) {}

/**
 * Qualified revision relation.
 */
export class Revision extends S.Class<Revision, Brand.Brand<"ProvRevision">>($I`Revision`)(
  {
    id: S.OptionFromOptionalKey(ObjectRef),
    type: S.OptionFromOptionalKey(RevisionType),
    hadGeneration: S.OptionFromOptionalKey(
      objectRefOrInline(
        "RevisionGenerationReference",
        "A qualified generation reference.",
        (): SyncSchema => Generation
      )
    ),
    hadActivity: S.OptionFromOptionalKey(
      objectRefOrInline("RevisionActivityReference", "A generating activity reference.", (): SyncSchema => Activity)
    ),
    hadUsage: S.OptionFromOptionalKey(
      objectRefOrInline("RevisionUsageReference", "A qualified usage reference.", (): SyncSchema => Usage)
    ),
    entity: objectRefOrInline(
      "RevisionEntityReference",
      "A revised entity or entity reference.",
      (): SyncSchema => Entity
    ),
  },
  $I.annote("Revision", {
    description: "A qualified revision relation represented as a typed derivation.",
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
      objectRefOrInline(
        "DelegationActivityReference",
        "A delegated activity or activity reference.",
        (): SyncSchema => Activity
      )
    ),
    hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
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
      objectRefOrInline(
        "AttributionAgentReference",
        "An attributing agent or agent reference.",
        (): SyncSchema => Agent
      )
    ),
    hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
  },
  $I.annote("Attribution", {
    description: "A qualified attribution relation.",
  })
) {}

const StartOrEndFields = {
  id: S.OptionFromOptionalKey(ObjectRef),
  atTime: S.OptionFromOptionalKey(ProvDateTime),
  atLocation: S.OptionFromOptionalKey(LocationReference),
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
    hadRole: S.OptionFromOptionalKey(OneOrMoreRolesOrRefIds),
    hadPlan: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMorePlansOrRefIds)),
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
  generatedAtTime: S.OptionFromOptionalKey(ProvDateTime),
  hadPrimarySource: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  value: S.OptionFromOptionalKey(ProvValue),
  specializationOf: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  invalidatedAtTime: S.OptionFromOptionalKey(ProvDateTime),
  wasInvalidatedBy: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreActivitiesOrRefIds)),
  wasQuotedFrom: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  wasRevisionOf: S.OptionFromOptionalKey(S.suspend((): SyncSchema => OneOrMoreEntitiesOrRefIds)),
  atLocation: S.OptionFromOptionalKey(LocationReference),
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
  qualifiedPrimarySource: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedPrimarySourceReference",
      "A qualified primary source relation or reference.",
      (): SyncSchema => PrimarySource
    )
  ),
  qualifiedQuotation: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedQuotationReference",
      "A qualified quotation relation or reference.",
      (): SyncSchema => Quotation
    )
  ),
  qualifiedRevision: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedRevisionReference",
      "A qualified revision relation or reference.",
      (): SyncSchema => Revision
    )
  ),
  qualifiedAttribution: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedAttributionReference",
      "A qualified attribution relation or reference.",
      (): SyncSchema => Attribution
    )
  ),
  hadMember: S.OptionFromOptionalKey(
    S.Array(
      objectRefOrInline(
        "CollectionMemberEntityReference",
        "A collection member entity or entity reference.",
        (): SyncSchema => Entity
      )
    )
  ),
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

class EntityShape extends S.Class<EntityShape>($I`EntityShape`)(
  EntityFields,
  $I.annote("EntityShape", {
    description: "Base PROV entity fields before entity invariants are applied.",
  })
) {}
type EntityValue = typeof EntityShape.Type;
const hasEntityGeneration = (value: unknown): value is Pick<EntityValue, "wasGeneratedBy"> =>
  P.isObject(value) && "wasGeneratedBy" in value;

const entityChecks = S.makeFilterGroup<EntityValue>(
  [
    S.makeFilter<EntityValue>((value) => !typeFieldHasAnyLiteral(value.type, entityTypeDisallowedLiterals), {
      identifier: $I`EntityForeignTypeCheck`,
      title: "Entity Foreign Type",
      description: "Entity objects must not declare explicit activity or agent type literals.",
      message: "Entity objects must not carry explicit activity or agent type markers",
    }),
    S.makeFilter<EntityValue>(
      (value) =>
        pipe(
          value.hadMember,
          O.match({
            onNone: () =>
              !hasCanonicalTypeMarker(value, [
                "Collection",
                "prov:Collection",
                "EmptyCollection",
                "prov:EmptyCollection",
              ]),
            onSome: (members) => {
              const isCollection = hasCanonicalTypeMarker(value, ["Collection", "prov:Collection"]);
              const isEmptyCollection = hasCanonicalTypeMarker(value, ["EmptyCollection", "prov:EmptyCollection"]);
              return (
                (isCollection && A.isReadonlyArrayNonEmpty(members)) ||
                (isEmptyCollection && A.isReadonlyArrayEmpty(members))
              );
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
  atLocation: S.OptionFromOptionalKey(LocationReference),
  qualifiedUsage: S.OptionFromOptionalKey(
    objectRefOrInlineOrMany(
      "QualifiedUsageReference",
      "A qualified usage relation or reference.",
      (): SyncSchema => Usage
    )
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
  generatedAtTime: S.optionalKey(S.Never),
  value: S.optionalKey(S.Never),
  specializationOf: S.optionalKey(S.Never),
  invalidatedAtTime: S.optionalKey(S.Never),
  wasInvalidatedBy: S.optionalKey(S.Never),
  wasQuotedFrom: S.optionalKey(S.Never),
  wasRevisionOf: S.optionalKey(S.Never),
  qualifiedGeneration: S.optionalKey(S.Never),
  qualifiedInvalidation: S.optionalKey(S.Never),
  qualifiedDerivation: S.optionalKey(S.Never),
  qualifiedPrimarySource: S.optionalKey(S.Never),
  qualifiedQuotation: S.optionalKey(S.Never),
  qualifiedRevision: S.optionalKey(S.Never),
  qualifiedAttribution: S.optionalKey(S.Never),
  hadMember: S.optionalKey(S.Never),
  agentType: S.optionalKey(S.Never),
  actedOnBehalfOf: S.optionalKey(S.Never),
  qualifiedDelegation: S.optionalKey(S.Never),
} as const;

class ActivityShape extends S.Class<ActivityShape>($I`ActivityShape`)(
  ActivityFields,
  $I.annote("ActivityShape", {
    description: "Base PROV activity fields before activity invariants are applied.",
  })
) {}
type ActivityValue = typeof ActivityShape.Type;
const hasActivityEndTime = (value: unknown): value is Pick<ActivityValue, "endedAtTime"> =>
  P.isObject(value) && "endedAtTime" in value;

const activityChecks = S.makeFilterGroup<ActivityValue>(
  [
    S.makeFilter<ActivityValue>((value) => !typeFieldHasAnyLiteral(value.type, activityTypeDisallowedLiterals), {
      identifier: $I`ActivityForeignTypeCheck`,
      title: "Activity Foreign Type",
      description: "Activity objects must not declare explicit entity or agent type literals.",
      message: "Activity objects must not carry explicit entity or agent type markers",
    }),
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
  atLocation: S.OptionFromOptionalKey(LocationReference),
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
  generatedAtTime: S.optionalKey(S.Never),
  value: S.optionalKey(S.Never),
  specializationOf: S.optionalKey(S.Never),
  invalidatedAtTime: S.optionalKey(S.Never),
  wasInvalidatedBy: S.optionalKey(S.Never),
  wasQuotedFrom: S.optionalKey(S.Never),
  wasRevisionOf: S.optionalKey(S.Never),
  qualifiedGeneration: S.optionalKey(S.Never),
  qualifiedInvalidation: S.optionalKey(S.Never),
  qualifiedDerivation: S.optionalKey(S.Never),
  qualifiedPrimarySource: S.optionalKey(S.Never),
  qualifiedQuotation: S.optionalKey(S.Never),
  qualifiedRevision: S.optionalKey(S.Never),
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

class AgentShape extends S.Class<AgentShape>($I`AgentShape`)(
  AgentFields,
  $I.annote("AgentShape", {
    description: "Base PROV agent fields before agent invariants are applied.",
  })
) {}
type AgentValue = typeof AgentShape.Type;

const agentChecks = S.makeFilterGroup<AgentValue>(
  [
    S.makeFilter<AgentValue>((value) => !typeFieldHasAnyLiteral(value.type, agentTypeDisallowedLiterals), {
      identifier: $I`AgentForeignTypeCheck`,
      title: "Agent Foreign Type",
      description: "Agent objects must not declare explicit entity or activity type literals.",
      message: "Agent objects must not carry explicit entity or activity type markers",
    }),
    S.makeFilter<AgentValue>((value) => hasSomeOption(value.id) || hasSomeOption(value.name), {
      identifier: $I`AgentIdentityCheck`,
      title: "Agent Identity",
      description: "Agents must provide at least an id or a name.",
      message: "Agents must define at least one of id or name",
    }),
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

/**
 * PROV bundle entity.
 */
export class Bundle extends S.Class<Bundle, Brand.Brand<"ProvBundle">>($I`Bundle`)(
  EntityShape.check(entityChecks).check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<EntityValue>(
        "Bundle",
        "Bundle Type",
        "Bundle entities must carry a canonical bundle class marker.",
        ["Bundle", "prov:Bundle"],
        "Bundle values must carry a canonical Bundle type marker"
      ),
    ])
  ),
  $I.annote("Bundle", {
    description: "A PROV bundle represented as a typed entity.",
  })
) {}

/**
 * PROV plan entity.
 */
export class Plan extends S.Class<Plan, Brand.Brand<"ProvPlan">>($I`Plan`)(
  EntityShape.check(entityChecks).check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<EntityValue>(
        "Plan",
        "Plan Type",
        "Plan entities must carry a canonical plan class marker.",
        ["Plan", "prov:Plan"],
        "Plan values must carry a canonical Plan type marker"
      ),
    ])
  ),
  $I.annote("Plan", {
    description: "A PROV plan represented as a typed entity.",
  })
) {}

/**
 * Plan or reference or array of either.
 */
export const OneOrMorePlansOrRefIds = objectRefOrInlineOrMany(
  "OneOrMorePlansOrRefIds",
  "A single plan reference, a nested plan, or an array mixing both.",
  (): SyncSchema => Plan
);

/**
 * Type for {@link OneOrMorePlansOrRefIds}.
 */
export type OneOrMorePlansOrRefIds = typeof OneOrMorePlansOrRefIds.Type;

/**
 * PROV collection entity.
 */
export class Collection extends S.Class<Collection, Brand.Brand<"ProvCollection">>($I`Collection`)(
  EntityShape.check(entityChecks).check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<EntityValue>(
        "Collection",
        "Collection Type",
        "Collection entities must carry a canonical collection class marker.",
        ["Collection", "prov:Collection"],
        "Collection values must carry a canonical Collection type marker"
      ),
    ])
  ),
  $I.annote("Collection", {
    description: "A PROV collection represented as a typed entity with non-empty members.",
  })
) {}

/**
 * PROV empty collection entity.
 */
export class EmptyCollection extends S.Class<EmptyCollection, Brand.Brand<"ProvEmptyCollection">>($I`EmptyCollection`)(
  EntityShape.check(entityChecks).check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<EntityValue>(
        "EmptyCollection",
        "Empty Collection Type",
        "Empty collection entities must carry a canonical empty collection class marker.",
        ["EmptyCollection", "prov:EmptyCollection"],
        "Empty collection values must carry a canonical EmptyCollection type marker"
      ),
    ])
  ),
  $I.annote("EmptyCollection", {
    description: "A PROV empty collection represented as a typed entity with no members.",
  })
) {}

/**
 * PROV person agent.
 */
export class Person extends S.Class<Person, Brand.Brand<"ProvPerson">>($I`Person`)(
  AgentShape.check(agentChecks).check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<AgentValue>(
        "Person",
        "Person Type",
        "Person agents must carry a canonical person class marker.",
        ["Person", "prov:Person"],
        "Person values must carry a canonical Person type marker"
      ),
    ])
  ),
  $I.annote("Person", {
    description: "A PROV person represented as a typed agent.",
  })
) {}

/**
 * PROV organization agent.
 */
export class Organization extends S.Class<Organization, Brand.Brand<"ProvOrganization">>($I`Organization`)(
  AgentShape.check(agentChecks).check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<AgentValue>(
        "Organization",
        "Organization Type",
        "Organization agents must carry a canonical organization class marker.",
        ["Organization", "prov:Organization"],
        "Organization values must carry a canonical Organization type marker"
      ),
    ])
  ),
  $I.annote("Organization", {
    description: "A PROV organization represented as a typed agent.",
  })
) {}

/**
 * PROV software agent.
 */
export class SoftwareAgent extends S.Class<SoftwareAgent, Brand.Brand<"ProvSoftwareAgent">>($I`SoftwareAgent`)(
  AgentShape.check(agentChecks).check(
    S.makeFilterGroup([
      makeRequiredTypeCheck<AgentValue>(
        "SoftwareAgent",
        "Software Agent Type",
        "Software agents must carry a canonical software agent class marker.",
        ["SoftwareAgent", "prov:SoftwareAgent"],
        "Software agent values must carry a canonical SoftwareAgent type marker"
      ),
    ])
  ),
  $I.annote("SoftwareAgent", {
    description: "A PROV software agent represented as a typed agent.",
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
        hasSomeOption(value.generatedAtTime) ||
        hasSomeOption(value.invalidatedAtTime) ||
        hasSomeOption(value.value) ||
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
 * The spec-first root accepts standalone entities, activities, agents,
 * and provenance graph arrays.
 */
export const ProvO = S.Union([Prov, EntityWithRequirements, ActivityWithRequirements, AgentWithRequirements]).annotate(
  $I.annote("ProvO", {
    description: "The top-level PROV-O schema accepting standalone PROV roots and provenance graph arrays.",
  })
);

/**
 * Type for {@link ProvO}.
 */
export type ProvO = typeof ProvO.Type;
