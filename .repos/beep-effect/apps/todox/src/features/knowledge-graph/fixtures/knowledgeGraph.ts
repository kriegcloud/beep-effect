import * as FC from "effect/FastCheck";

export type KnowledgeEntity = {
  readonly id: string;
  readonly mention: string;
  readonly canonicalName?: string | undefined;
  readonly primaryType: string;
  readonly confidence: number;
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
};

export type KnowledgeRelation = {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: string;
  readonly confidence: number;
  readonly objectId?: string | undefined;
  readonly literalValue?: string | undefined;
  readonly literalType?: string | undefined;
  readonly evidence?: string | undefined;
};

export type KnowledgeGraphStats = {
  readonly entityCount: number;
  readonly relationCount: number;
  readonly unresolvedSubjects: number;
  readonly unresolvedObjects: number;
};

export type KnowledgeGraph = {
  readonly entities: ReadonlyArray<KnowledgeEntity>;
  readonly relations: ReadonlyArray<KnowledgeRelation>;
  readonly stats: KnowledgeGraphStats;
};

const idArb: FC.Arbitrary<string> = FC.hexaString({ minLength: 10, maxLength: 10 }).map((h) => `k_${h}`);

const confidenceArb: FC.Arbitrary<number> = FC.float({ min: 0, max: 1, noNaN: true });

const typeIriArb: FC.Arbitrary<string> = FC.constantFrom(
  "https://schema.org/Person",
  "https://schema.org/Organization",
  "https://schema.org/Place",
  "https://schema.org/Event",
  "https://schema.org/Product"
);

const predicateIriArb: FC.Arbitrary<string> = FC.constantFrom(
  "https://schema.org/knows",
  "https://schema.org/memberOf",
  "https://schema.org/worksFor",
  "https://schema.org/location",
  "https://schema.org/attendee",
  "https://schema.org/mentions",
  "https://schema.org/about",
  "https://schema.org/name",
  "https://schema.org/description"
);

const attributeKeyArb: FC.Arbitrary<string> = FC.constantFrom("source", "lang", "score", "kind");

const attributeValueArb: FC.Arbitrary<string | number | boolean> = FC.oneof(
  FC.string({ minLength: 1, maxLength: 24 }),
  FC.integer({ min: 0, max: 1000 }),
  FC.boolean()
);

const attributesArb: FC.Arbitrary<Readonly<Record<string, string | number | boolean>>> = FC.dictionary(
  attributeKeyArb,
  attributeValueArb,
  { maxKeys: 4 }
);

const entityFieldsArb: FC.Arbitrary<Omit<KnowledgeEntity, "id">> = FC.record({
  mention: FC.string({ minLength: 3, maxLength: 40 }),
  canonicalName: FC.option(FC.string({ minLength: 3, maxLength: 40 }), { nil: undefined }),
  primaryType: typeIriArb,
  confidence: confidenceArb,
  attributes: attributesArb,
});

const relationArb = (ids: ReadonlyArray<string>): FC.Arbitrary<KnowledgeRelation> =>
  FC.oneof(
    FC.record({
      id: idArb,
      subjectId: FC.constantFrom(...ids),
      predicate: predicateIriArb,
      confidence: confidenceArb,
      objectId: FC.constantFrom(...ids),
    }),
    FC.record({
      id: idArb,
      subjectId: FC.constantFrom(...ids),
      predicate: predicateIriArb,
      confidence: confidenceArb,
      literalValue: FC.string({ minLength: 1, maxLength: 80 }),
      literalType: FC.option(FC.constantFrom("string", "number", "dateTime"), { nil: undefined }),
      evidence: FC.option(FC.string({ minLength: 0, maxLength: 80 }), { nil: undefined }),
    })
  );

/**
 * Lightweight, client-safe fixture generator for the 2D graph demo.
 *
 * This intentionally does NOT import `@beep/knowledge-server` (Bun-only code paths).
 */
export const knowledgeGraphArbitrary: FC.Arbitrary<KnowledgeGraph> = FC.uniqueArray(idArb, {
  minLength: 8,
  maxLength: 40,
}).chain((ids) => {
  const entities = FC.array(entityFieldsArb, { minLength: ids.length, maxLength: ids.length }).map((fields) => {
    // Force 1 entity per id so relations never reference missing nodes.
    return ids.map((id, i) => ({ id, ...fields[i]! }));
  });
  const relations = FC.array(relationArb(ids), { minLength: 10, maxLength: 120 });

  return FC.record({
    entities,
    relations,
  }).map(({ entities, relations }) => {
    return {
      entities,
      relations,
      stats: {
        entityCount: entities.length,
        relationCount: relations.length,
        unresolvedSubjects: 0,
        unresolvedObjects: 0,
      },
    } satisfies KnowledgeGraph;
  });
});
