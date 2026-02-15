import { $KnowledgeServerId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import type { ExtractedTriple } from "./schemas/relation-output.schema";

const $I = $KnowledgeServerId.create("Extraction/GraphAssembler");

const SchemaOrgTypeIris = [
  "https://schema.org/Event",
  "https://schema.org/Organization",
  "https://schema.org/Person",
  "https://schema.org/Place",
  "https://schema.org/LocalBusiness",
  "https://schema.org/Product",
  "https://schema.org/Offer",
  "https://schema.org/Action",
] as const;

const isSchemaOrgTypeIri = (value: string): boolean => (SchemaOrgTypeIris as readonly string[]).includes(value);

const SchemaOrgPredicateIris = {
  worksFor: "https://schema.org/worksFor",
  memberOf: "https://schema.org/memberOf",
  location: "https://schema.org/location",
  organizer: "https://schema.org/organizer",
  attendee: "https://schema.org/attendee",
  offers: "https://schema.org/offers",
  itemOffered: "https://schema.org/itemOffered",
  offeredBy: "https://schema.org/offeredBy",
  brand: "https://schema.org/brand",
  agent: "https://schema.org/agent",
  object: "https://schema.org/object",
  price: "https://schema.org/price",
  priceCurrency: "https://schema.org/priceCurrency",
  startDate: "https://schema.org/startDate",
  email: "https://schema.org/email",
} as const;

const normalizeEntityIndexKey = (value: string): string => Str.toLowerCase(Str.trim(value));

const schemaOrgCurrency = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;

const buildEntityIndex = (entities: ReadonlyArray<AssembledEntity>): Record<string, string> => {
  const index: Record<string, string> = {};
  for (const entity of entities) {
    index[normalizeEntityIndexKey(entity.canonicalName ?? entity.mention)] = entity.id;
    index[normalizeEntityIndexKey(entity.mention)] = entity.id;
  }
  return index;
};

export class AssembledEntityAttributeValue extends S.Union(S.String, S.Number, S.Boolean).annotations(
  $I.annotations("AssembledEntityAttributeValue", {
    description: "Value of an assembled entity attribute",
  })
) {}

export declare namespace AssembledEntityAttributeValue {
  export type Type = typeof AssembledEntityAttributeValue;
}

export class AssembledEntityAttributes extends S.Record({
  key: S.String,
  value: AssembledEntityAttributeValue,
}).annotations(
  $I.annotations("AssembledEntityAttributes", {
    description: "Attributes of an assembled entity",
  })
) {}

export declare namespace AssembledEntityAttributes {
  export type Type = typeof AssembledEntityAttributes;
}

export class AssembledEntity extends S.Class<AssembledEntity>($I`AssembledEntity`)(
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
    mention: S.String,
    primaryType: S.String,
    types: S.Array(S.String),
    attributes: AssembledEntityAttributes,
    confidence: S.Number,
    canonicalName: S.optional(S.String),
  },
  $I.annotations("AssembledEntity", {
    description: "Assembled entity",
  })
) {}

export class AssembledRelation extends S.Class<AssembledRelation>($I`AssembledRelation`)(
  {
    id: KnowledgeEntityIds.RelationId,
    subjectId: KnowledgeEntityIds.KnowledgeEntityId,
    predicate: S.String,
    objectId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    literalValue: S.optional(S.String),
    literalType: S.optional(S.String),
    confidence: S.Number,
    evidence: S.optional(S.String),
    evidenceStartChar: S.optional(S.Number),
    evidenceEndChar: S.optional(S.Number),
  },
  $I.annotations("AssembledRelation", {
    description: "Assembled relation",
  })
) {}

export class KnowledgeGraphStats extends S.Class<KnowledgeGraphStats>($I`KnowledgeGraphStats`)(
  {
    entityCount: S.Number,
    relationCount: S.Number,
    unresolvedSubjects: S.Number,
    unresolvedObjects: S.Number,
  },
  $I.annotations("KnowledgeGraphStats", {
    description: "Statistics for a knowledge graph",
  })
) {}

export class KnowledgeGraph extends S.Class<KnowledgeGraph>($I`KnowledgeGraph`)(
  {
    entities: S.Array(AssembledEntity),
    relations: S.Array(AssembledRelation),
    entityIndex: S.Record({ key: S.String, value: S.String }),
    stats: KnowledgeGraphStats,
  },
  $I.annotations("KnowledgeGraph", {
    description: "Knowledge graph containing entities and relations",
    arbitrary: () => (fc) =>
      fc
        .record({
          seed: fc.nat({ max: 0x7fffffff }),
          personCount: fc.integer({ min: 3, max: 14 }),
          orgCount: fc.integer({ min: 1, max: 6 }),
          placeCount: fc.integer({ min: 1, max: 5 }),
          businessCount: fc.integer({ min: 1, max: 4 }),
          productCount: fc.integer({ min: 3, max: 16 }),
          offerCount: fc.integer({ min: 2, max: 18 }),
          eventCount: fc.integer({ min: 1, max: 6 }),
          actionCount: fc.integer({ min: 1, max: 8 }),
          extraEdgeFactor: fc.integer({ min: 0, max: 2 }),
        })
        .map(
          ({
            seed,
            personCount,
            orgCount,
            placeCount,
            businessCount,
            productCount,
            offerCount,
            eventCount,
            actionCount,
            extraEdgeFactor,
          }) => {
            // FastCheck drives the shape (counts) while faker provides realistic payloads.
            // Seeding faker makes samples reproducible for a given FC seed.
            faker.seed(seed);

            const personType = "https://schema.org/Person";
            const orgType = "https://schema.org/Organization";
            const placeType = "https://schema.org/Place";
            const businessType = "https://schema.org/LocalBusiness";
            const productType = "https://schema.org/Product";
            const offerType = "https://schema.org/Offer";
            const eventType = "https://schema.org/Event";
            const actionType = "https://schema.org/Action";

            const mkConfidence = (min = 0.6, max = 0.98): number => faker.number.float({ min, max, fractionDigits: 2 });
            const chance = (p: number): boolean => faker.number.float({ min: 0, max: 1 }) < p;

            const mkEntity = (input: {
              primaryType: string;
              mention: string;
              canonicalName?: string;
              additionalTypes?: ReadonlyArray<string>;
              attributes?: Record<string, string | number | boolean>;
            }): AssembledEntity => {
              const seen = new Set<string>();
              const types: Array<string> = [];
              for (const t of [input.primaryType, ...(input.additionalTypes ?? [])]) {
                if (!seen.has(t)) {
                  seen.add(t);
                  types.push(t);
                }
              }

              return new AssembledEntity({
                id: KnowledgeEntityIds.KnowledgeEntityId.create(),
                mention: input.mention,
                primaryType: isSchemaOrgTypeIri(input.primaryType) ? input.primaryType : personType,
                types,
                attributes: input.attributes ?? {},
                confidence: mkConfidence(0.7, 0.98),
                ...(input.canonicalName !== undefined && { canonicalName: input.canonicalName }),
              });
            };

            const people: Array<AssembledEntity> = [];
            for (let i = 0; i < personCount; i++) {
              const name = faker.person.fullName();
              const firstName = name.split(" ")[0] ?? name;
              people.push(
                mkEntity({
                  primaryType: personType,
                  mention: name,
                  canonicalName: name,
                  attributes: {
                    "https://schema.org/name": name,
                    "https://schema.org/jobTitle": faker.person.jobTitle(),
                    "https://schema.org/email": faker.internet.email({ firstName }),
                  },
                })
              );
            }

            const places: Array<AssembledEntity> = [];
            for (let i = 0; i < placeCount; i++) {
              const city = faker.location.city();
              const region = faker.location.state({ abbreviated: true });
              const mention = `${city}, ${region}`;
              places.push(
                mkEntity({
                  primaryType: placeType,
                  mention,
                  canonicalName: mention,
                  attributes: {
                    "https://schema.org/name": mention,
                    "https://schema.org/address": faker.location.streetAddress({ useFullAddress: true }),
                    "https://schema.org/latitude": faker.location.latitude(),
                    "https://schema.org/longitude": faker.location.longitude(),
                  },
                })
              );
            }

            const orgs: Array<AssembledEntity> = [];
            for (let i = 0; i < orgCount; i++) {
              const mention = faker.company.name();
              orgs.push(
                mkEntity({
                  primaryType: orgType,
                  mention,
                  canonicalName: mention,
                  attributes: {
                    "https://schema.org/name": mention,
                    "https://schema.org/url": faker.internet.url(),
                    "https://schema.org/industry": faker.company.buzzNoun(),
                  },
                })
              );
            }

            const businesses: Array<AssembledEntity> = [];
            for (let i = 0; i < businessCount; i++) {
              const mention = `${faker.company.name()} ${faker.helpers.arrayElement(["Cafe", "Market", "Studio", "Works"])}`;
              businesses.push(
                mkEntity({
                  primaryType: businessType,
                  mention,
                  canonicalName: mention,
                  additionalTypes: [orgType],
                  attributes: {
                    "https://schema.org/name": mention,
                    "https://schema.org/telephone": faker.phone.number(),
                    "https://schema.org/priceRange": faker.helpers.arrayElement(["$", "$$", "$$$"]),
                  },
                })
              );
            }

            const products: Array<AssembledEntity> = [];
            for (let i = 0; i < productCount; i++) {
              const mention = faker.commerce.productName();
              products.push(
                mkEntity({
                  primaryType: productType,
                  mention,
                  canonicalName: mention,
                  attributes: {
                    "https://schema.org/name": mention,
                    "https://schema.org/sku": faker.string.alphanumeric({
                      length: { min: 6, max: 10 },
                      casing: "upper",
                    }),
                    "https://schema.org/category": faker.commerce.department(),
                  },
                })
              );
            }

            const offers: Array<AssembledEntity> = [];
            for (let i = 0; i < offerCount; i++) {
              const product = faker.helpers.arrayElement(products);
              const mention = `Offer: ${product.mention}`;
              offers.push(
                mkEntity({
                  primaryType: offerType,
                  mention,
                  canonicalName: mention,
                  attributes: {
                    "https://schema.org/name": mention,
                    "https://schema.org/price": Number(faker.commerce.price({ min: 5, max: 2000, dec: 2 })),
                    "https://schema.org/priceCurrency": faker.helpers.arrayElement(schemaOrgCurrency),
                  },
                })
              );
            }

            const events: Array<AssembledEntity> = [];
            for (let i = 0; i < eventCount; i++) {
              const mention = `${faker.company.catchPhrase()} Summit`;
              const start = faker.date.soon({ days: 90 });
              events.push(
                mkEntity({
                  primaryType: eventType,
                  mention,
                  canonicalName: mention,
                  attributes: {
                    "https://schema.org/name": mention,
                    "https://schema.org/startDate": start.toISOString(),
                    "https://schema.org/isAccessibleForFree": faker.datatype.boolean(),
                  },
                })
              );
            }

            const actions: Array<AssembledEntity> = [];
            for (let i = 0; i < actionCount; i++) {
              const verb = faker.helpers.arrayElement(["Purchase", "Attend", "Book", "Review", "Deliver"]);
              const mention = `${verb} Action`;
              actions.push(
                mkEntity({
                  primaryType: actionType,
                  mention,
                  canonicalName: mention,
                  attributes: {
                    "https://schema.org/name": mention,
                    "https://schema.org/actionStatus": faker.helpers.arrayElement([
                      "PotentialActionStatus",
                      "ActiveActionStatus",
                    ]),
                  },
                })
              );
            }

            const entities: Array<AssembledEntity> = [
              ...people,
              ...orgs,
              ...businesses,
              ...places,
              ...products,
              ...offers,
              ...events,
              ...actions,
            ];

            const relations: Array<AssembledRelation> = [];

            const mkRelation = (input: {
              subjectId: string;
              predicate: string;
              objectId?: string;
              literalValue?: string;
              literalType?: string;
              confidence?: number;
              evidence?: string;
              evidenceStartChar?: number;
              evidenceEndChar?: number;
            }): void => {
              const confidence = input.confidence ?? mkConfidence(0.65, 0.97);
              relations.push(
                new AssembledRelation({
                  id: KnowledgeEntityIds.RelationId.create(),
                  subjectId: input.subjectId,
                  predicate: input.predicate,
                  ...(input.objectId !== undefined && { objectId: input.objectId }),
                  ...(input.literalValue !== undefined && { literalValue: input.literalValue }),
                  ...(input.literalType !== undefined && { literalType: input.literalType }),
                  confidence,
                  ...(input.evidence !== undefined && { evidence: input.evidence }),
                  ...(input.evidenceStartChar !== undefined && { evidenceStartChar: input.evidenceStartChar }),
                  ...(input.evidenceEndChar !== undefined && { evidenceEndChar: input.evidenceEndChar }),
                })
              );
            };

            const maybeEvidence = (
              text: string
            ):
              | {}
              | {
                  evidence: string;
                  evidenceStartChar: number;
                  evidenceEndChar: number;
                } => {
              if (chance(0.55)) return {};
              return { evidence: text, evidenceStartChar: 0, evidenceEndChar: text.length };
            };

            const pickMaybe = <T>(items: ReadonlyArray<T>): T | undefined =>
              items.length === 0 ? undefined : faker.helpers.arrayElement(items);

            // Person -> Organization
            for (const person of people) {
              const org = pickMaybe(orgs);
              if (org) {
                const ev = `${person.mention} works for ${org.mention}.`;
                mkRelation({
                  subjectId: person.id,
                  predicate: SchemaOrgPredicateIris.worksFor,
                  objectId: org.id,
                  ...maybeEvidence(ev),
                });
              }

              const member = pickMaybe([...businesses, ...orgs]);
              if (member && chance(0.5)) {
                const ev = `${person.mention} is a member of ${member.mention}.`;
                mkRelation({
                  subjectId: person.id,
                  predicate: SchemaOrgPredicateIris.memberOf,
                  objectId: member.id,
                  ...maybeEvidence(ev),
                });
              }

              // A few literal facts as proper triples for variety
              if (chance(0.35)) {
                mkRelation({
                  subjectId: person.id,
                  predicate: SchemaOrgPredicateIris.email,
                  literalValue: faker.internet.email(),
                  literalType: "http://www.w3.org/2001/XMLSchema#string",
                });
              }
            }

            // Locations
            for (const org of [...orgs, ...businesses]) {
              const place = pickMaybe(places);
              if (place) {
                mkRelation({
                  subjectId: org.id,
                  predicate: SchemaOrgPredicateIris.location,
                  objectId: place.id,
                });
              }
            }

            // Product branding
            for (const product of products) {
              const org = pickMaybe(orgs);
              if (org) {
                mkRelation({
                  subjectId: product.id,
                  predicate: SchemaOrgPredicateIris.brand,
                  objectId: org.id,
                });
              }
            }

            // Offers connect products and businesses and include a few literal prices/currencies.
            for (const offer of offers) {
              const product = pickMaybe(products);
              const business = pickMaybe(businesses);

              if (product) {
                mkRelation({
                  subjectId: offer.id,
                  predicate: SchemaOrgPredicateIris.itemOffered,
                  objectId: product.id,
                });
              }

              if (business) {
                mkRelation({
                  subjectId: business.id,
                  predicate: SchemaOrgPredicateIris.offers,
                  objectId: offer.id,
                });
                mkRelation({
                  subjectId: offer.id,
                  predicate: SchemaOrgPredicateIris.offeredBy,
                  objectId: business.id,
                });
              }

              if (chance(0.65)) {
                const price = faker.commerce.price({ min: 5, max: 2000, dec: 2 });
                mkRelation({
                  subjectId: offer.id,
                  predicate: SchemaOrgPredicateIris.price,
                  literalValue: price,
                  literalType: "http://www.w3.org/2001/XMLSchema#decimal",
                });
                mkRelation({
                  subjectId: offer.id,
                  predicate: SchemaOrgPredicateIris.priceCurrency,
                  literalValue: faker.helpers.arrayElement(schemaOrgCurrency),
                  literalType: "http://www.w3.org/2001/XMLSchema#string",
                });
              }
            }

            // Events link organizer/location/attendees.
            for (const event of events) {
              const org = pickMaybe(orgs);
              const place = pickMaybe(places);
              if (org) {
                mkRelation({
                  subjectId: event.id,
                  predicate: SchemaOrgPredicateIris.organizer,
                  objectId: org.id,
                });
              }
              if (place) {
                mkRelation({
                  subjectId: event.id,
                  predicate: SchemaOrgPredicateIris.location,
                  objectId: place.id,
                });
              }

              const attendeeCount = faker.number.int({ min: 1, max: Math.min(people.length, 4 + extraEdgeFactor) });
              for (let i = 0; i < attendeeCount; i++) {
                const person = faker.helpers.arrayElement(people);
                mkRelation({
                  subjectId: event.id,
                  predicate: SchemaOrgPredicateIris.attendee,
                  objectId: person.id,
                });
              }

              if (chance(0.5)) {
                mkRelation({
                  subjectId: event.id,
                  predicate: SchemaOrgPredicateIris.startDate,
                  literalValue: faker.date.soon({ days: 365 }).toISOString(),
                  literalType: "http://www.w3.org/2001/XMLSchema#dateTime",
                });
              }
            }

            // Actions link an agent to an object (often a product; sometimes an event).
            for (const action of actions) {
              const agent = pickMaybe(people);
              const object = pickMaybe(faker.helpers.arrayElement([products, events, offers]));
              const place = pickMaybe(places);

              if (agent) {
                mkRelation({
                  subjectId: action.id,
                  predicate: SchemaOrgPredicateIris.agent,
                  objectId: agent.id,
                });
              }
              if (object) {
                mkRelation({
                  subjectId: action.id,
                  predicate: SchemaOrgPredicateIris.object,
                  objectId: object.id,
                });
              }
              if (place && chance(0.45)) {
                mkRelation({
                  subjectId: action.id,
                  predicate: SchemaOrgPredicateIris.location,
                  objectId: place.id,
                });
              }
            }

            // Extra light cross-linking to make the force graph less "star shaped".
            const crossLinkBudget = faker.number.int({
              min: 0,
              max: Math.max(1, Math.floor(entities.length / 3)) * (1 + extraEdgeFactor),
            });
            for (let i = 0; i < crossLinkBudget; i++) {
              const s = faker.helpers.arrayElement(entities);
              const o = faker.helpers.arrayElement(entities);
              if (s.id === o.id) continue;
              mkRelation({
                subjectId: s.id,
                predicate: faker.helpers.arrayElement([
                  SchemaOrgPredicateIris.memberOf,
                  SchemaOrgPredicateIris.location,
                  SchemaOrgPredicateIris.organizer,
                ]),
                objectId: o.id,
                confidence: mkConfidence(0.4, 0.85),
              });
            }

            const entityIndex = buildEntityIndex(entities);

            const graph: KnowledgeGraph = {
              entities,
              relations,
              entityIndex,
              stats: new KnowledgeGraphStats({
                entityCount: entities.length,
                relationCount: relations.length,
                unresolvedSubjects: 0,
                unresolvedObjects: 0,
              }),
            };

            return graph;
          }
        ),
  })
) {}
export class GraphAssemblyConfig extends S.Class<GraphAssemblyConfig>($I`GraphAssemblyConfig`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: KnowledgeEntityIds.OntologyId,
    mergeEntities: S.optional(S.Boolean),
  },
  $I.annotations("GraphAssemblyConfig", {
    description: "Configuration for graph assembly",
  })
) {}

export interface GraphAssemblerShape {
  readonly assemble: (
    entities: readonly ClassifiedEntity[],
    relations: readonly ExtractedTriple[],
    config: GraphAssemblyConfig
  ) => Effect.Effect<KnowledgeGraph, never>;
  readonly merge: (
    graphs: readonly KnowledgeGraph[],
    config: GraphAssemblyConfig
  ) => Effect.Effect<KnowledgeGraph, never>;
}

export class GraphAssembler extends Context.Tag($I`GraphAssembler`)<GraphAssembler, GraphAssemblerShape>() {}

const serviceEffect: Effect.Effect<GraphAssemblerShape> = Effect.succeed({
  assemble: Effect.fnUntraced(function* (
    entities: readonly ClassifiedEntity[],
    relations: readonly ExtractedTriple[],
    config: GraphAssemblyConfig
  ) {
    yield* Effect.logDebug("Assembling knowledge graph", {
      entityCount: A.length(entities),
      relationCount: A.length(relations),
    });

    const entityIndex = MutableHashMap.empty<string, string>();
    const assembledEntities = A.reduce(entities, A.empty<AssembledEntity>(), (acc, entity) => {
      const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);

      if (config.mergeEntities && MutableHashMap.has(entityIndex, key)) {
        return acc;
      }

      const id = KnowledgeEntityIds.KnowledgeEntityId.create();
      MutableHashMap.set(entityIndex, key, id);

      const mentionKey = Str.toLowerCase(entity.mention);
      if (!MutableHashMap.has(entityIndex, mentionKey)) {
        MutableHashMap.set(entityIndex, mentionKey, id);
      }

      const types = entity.additionalTypes ? [entity.typeIri, ...entity.additionalTypes] : [entity.typeIri];

      acc.push(
        new AssembledEntity({
          id,
          mention: entity.mention,
          primaryType: entity.typeIri,
          types,
          attributes: entity.attributes ?? {},
          confidence: entity.confidence,
          ...(entity.canonicalName !== undefined && { canonicalName: entity.canonicalName }),
        })
      );
      return acc;
    });

    const {
      assembled: assembledRelations,
      unresolvedSubjects,
      unresolvedObjects,
    } = A.reduce(
      relations,
      { assembled: A.empty<AssembledRelation>(), unresolvedSubjects: 0, unresolvedObjects: 0 },
      (acc, triple) => {
        const subjectKey = Str.toLowerCase(triple.subjectMention);
        const subjectIdOpt = MutableHashMap.get(entityIndex, subjectKey);

        if (O.isNone(subjectIdOpt)) {
          return { ...acc, unresolvedSubjects: acc.unresolvedSubjects + 1 };
        }
        const subjectId = subjectIdOpt.value;
        const relationId = KnowledgeEntityIds.RelationId.create();

        if (triple.objectMention) {
          const objectKey = Str.toLowerCase(triple.objectMention);
          const objectIdOpt = MutableHashMap.get(entityIndex, objectKey);

          if (O.isNone(objectIdOpt)) {
            return { ...acc, unresolvedObjects: acc.unresolvedObjects + 1 };
          }

          acc.assembled.push(
            new AssembledRelation({
              id: relationId,
              subjectId,
              predicate: triple.predicateIri,
              objectId: objectIdOpt.value,
              confidence: triple.confidence,
              ...(triple.evidence !== undefined && { evidence: triple.evidence }),
              ...(triple.evidenceStartChar !== undefined && { evidenceStartChar: triple.evidenceStartChar }),
              ...(triple.evidenceEndChar !== undefined && { evidenceEndChar: triple.evidenceEndChar }),
            })
          );
        } else if (triple.literalValue !== undefined) {
          acc.assembled.push(
            new AssembledRelation({
              id: relationId,
              subjectId,
              predicate: triple.predicateIri,
              literalValue: triple.literalValue,
              confidence: triple.confidence,
              ...(triple.literalType !== undefined && { literalType: triple.literalType }),
              ...(triple.evidence !== undefined && { evidence: triple.evidence }),
              ...(triple.evidenceStartChar !== undefined && { evidenceStartChar: triple.evidenceStartChar }),
              ...(triple.evidenceEndChar !== undefined && { evidenceEndChar: triple.evidenceEndChar }),
            })
          );
        }

        return acc;
      }
    );

    const entityIndexRecord = mutableHashMapToRecord(entityIndex);

    const graph = new KnowledgeGraph({
      entities: assembledEntities,
      relations: assembledRelations,
      entityIndex: entityIndexRecord,
      stats: new KnowledgeGraphStats({
        entityCount: A.length(assembledEntities),
        relationCount: A.length(assembledRelations),
        unresolvedSubjects,
        unresolvedObjects,
      }),
    });

    yield* Effect.logInfo("Knowledge graph assembled", graph.stats);

    return graph;
  }),

  merge: (graphs: readonly KnowledgeGraph[], _config: GraphAssemblyConfig): Effect.Effect<KnowledgeGraph, never> =>
    Effect.sync(() => {
      if (A.isEmptyReadonlyArray(graphs)) {
        return new KnowledgeGraph({
          entities: A.empty<AssembledEntity>(),
          relations: A.empty<AssembledRelation>(),
          entityIndex: {},
          stats: new KnowledgeGraphStats({
            entityCount: 0,
            relationCount: 0,
            unresolvedSubjects: 0,
            unresolvedObjects: 0,
          }),
        });
      }

      if (A.isNonEmptyReadonlyArray(graphs) && A.length(graphs) === 1) {
        return graphs[0];
      }

      const entityIndex = MutableHashMap.empty<string, AssembledEntity>();
      const idMapping = MutableHashMap.empty<string, string>();

      for (const graph of graphs) {
        for (const entity of graph.entities) {
          const key = Str.toLowerCase(entity.canonicalName ?? entity.mention);

          if (!MutableHashMap.has(entityIndex, key)) {
            MutableHashMap.set(entityIndex, key, entity);
            MutableHashMap.set(idMapping, entity.id, entity.id);
          } else {
            const existing = O.getOrThrow(MutableHashMap.get(entityIndex, key));
            MutableHashMap.set(idMapping, entity.id, existing.id);
          }
        }
      }

      const relationSet = MutableHashSet.empty<string>();

      const relations = F.pipe(
        A.flatMap([...graphs], (graph) => [...graph.relations]),
        A.filterMap((relation) => {
          const mappedSubjectId = F.pipe(
            MutableHashMap.get(idMapping, relation.subjectId),
            O.getOrElse(() => relation.subjectId)
          );
          const mappedObjectId = F.pipe(
            O.fromNullable(relation.objectId),
            O.map((oid) =>
              F.pipe(
                MutableHashMap.get(idMapping, oid),
                O.getOrElse(() => oid)
              )
            ),
            O.getOrUndefined
          );

          const key = [mappedSubjectId, relation.predicate, mappedObjectId ?? relation.literalValue ?? ""].join("|");

          if (MutableHashSet.has(relationSet, key)) {
            return O.none();
          }

          MutableHashSet.add(relationSet, key);
          return O.some(
            new AssembledRelation({
              id: relation.id,
              subjectId: mappedSubjectId,
              predicate: relation.predicate,
              confidence: relation.confidence,
              ...(mappedObjectId !== undefined && { objectId: mappedObjectId }),
              ...(relation.objectId === undefined && relation.literalValue !== undefined
                ? { literalValue: relation.literalValue }
                : {}),
              ...(relation.literalType !== undefined ? { literalType: relation.literalType } : {}),
              ...(relation.evidence !== undefined ? { evidence: relation.evidence } : {}),
              ...(relation.evidenceStartChar !== undefined ? { evidenceStartChar: relation.evidenceStartChar } : {}),
              ...(relation.evidenceEndChar !== undefined ? { evidenceEndChar: relation.evidenceEndChar } : {}),
            })
          );
        })
      );

      const entities = A.empty<AssembledEntity>();
      MutableHashMap.forEach(entityIndex, (entity) => {
        entities.push(entity);
      });

      const entityIndexRecord: Record<string, string> = {};
      MutableHashMap.forEach(entityIndex, (entity, key) => {
        entityIndexRecord[key] = entity.id;
      });

      return new KnowledgeGraph({
        entities,
        relations,
        entityIndex: entityIndexRecord,
        stats: new KnowledgeGraphStats({
          entityCount: A.length(entities),
          relationCount: A.length(relations),
          unresolvedSubjects: 0,
          unresolvedObjects: 0,
        }),
      });
    }),
});

export const GraphAssemblerLive = Layer.effect(GraphAssembler, serviceEffect);

const mutableHashMapToRecord = (map: MutableHashMap.MutableHashMap<string, string>): Record<string, string> => {
  const result = R.empty<string, string>();
  MutableHashMap.forEach(map, (value, key) => {
    result[key] = value;
  });
  return result;
};
