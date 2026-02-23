import { Entity, Relation } from "@beep/knowledge-domain/entities";
import type {
  GraphContext,
  GraphContextEntity,
  GraphContextRelation,
} from "@beep/knowledge-server/GraphRAG/PromptTemplates";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Arbitrary from "effect/Arbitrary";
import type * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as FC from "effect/FastCheck";
import * as O from "effect/Option";

const entityArb = () => FC.sample(Arbitrary.make(Entity.Model), 1)[0]!;
const relationArb = () => FC.sample(Arbitrary.make(Relation.Model), 1)[0]!;

let relationRowIdCounter = 0;
const nextRelationRowId = () => {
  relationRowIdCounter += 1;
  return relationRowIdCounter;
};

export const graphRagFixtureIds = {
  entity1: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__11111111-1111-1111-1111-111111111111"),
  entity2: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__22222222-2222-2222-2222-222222222222"),
  relation1: KnowledgeEntityIds.RelationId.make("knowledge_relation__33333333-3333-3333-3333-333333333333"),
} as const;

export interface GraphContextEntityInput {
  readonly id: string;
  readonly mention: string;
  readonly types: ReadonlyArray<string>;
  readonly attributes?: Readonly<Record<string, string>>;
}

export const makeGraphContextEntity = (input: GraphContextEntityInput): GraphContextEntity => {
  const base: GraphContextEntity = {
    id: input.id,
    mention: input.mention,
    types: input.types,
  };

  return input.attributes === undefined ? base : { ...base, attributes: input.attributes };
};

export const makeGraphContextRelation = (input: {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: string;
  readonly objectId: string;
}): GraphContextRelation => ({
  id: input.id,
  subjectId: input.subjectId,
  predicate: input.predicate,
  objectId: input.objectId,
});

export const makeGraphContext = (input?: {
  readonly entities?: ReadonlyArray<GraphContextEntity>;
  readonly relations?: ReadonlyArray<GraphContextRelation>;
}): GraphContext => ({
  entities: input?.entities ?? [],
  relations: input?.relations ?? [],
});

export interface DomainEntityInput {
  readonly id?: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly mention: string;
  readonly types: A.NonEmptyReadonlyArray<string>;
  readonly attributes?: Readonly<Record<string, string>>;
}

export const makeDomainEntity = (input: DomainEntityInput): Entity.Model => {
  const base = entityArb();
  return new Entity.Model({
    ...base,
    id: input.id ?? KnowledgeEntityIds.KnowledgeEntityId.create(),
    mention: input.mention,
    types: input.types,
    attributes: input.attributes ?? {},
    organizationId: SharedEntityIds.OrganizationId.create(),
    ontologyId: O.some(KnowledgeEntityIds.OntologyId.create()),
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
  });
};

export interface DomainRelationInput {
  readonly subjectId: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly predicate: string;
  readonly objectId?: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly literalValue?: string;
  readonly literalType?: string;
}

export const makeDomainRelation = (input: DomainRelationInput): Relation.Model => {
  const base = relationArb();
  return new Relation.Model({
    ...base,
    id: KnowledgeEntityIds.RelationId.create(),
    subjectId: input.subjectId,
    predicate: input.predicate,
    objectId: O.fromNullable(input.objectId),
    literalValue: O.fromNullable(input.literalValue),
    literalType: O.fromNullable(input.literalType),
    organizationId: SharedEntityIds.OrganizationId.create(),
    ontologyId: KnowledgeEntityIds.OntologyId.create(),
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
    _rowId: KnowledgeEntityIds.RelationId.privateSchema.make(nextRelationRowId()),
    deletedAt: O.none(),
    version: 1,
    source: O.some("test"),
  });
};
