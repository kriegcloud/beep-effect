import { $KnowledgeServerId } from "@beep/identity/packages";
import { IRI, Literal, Quad } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { KnowledgeGraph } from "../Extraction/GraphAssembler";
import { RDFS } from "../Ontology/constants";
import { PROVENANCE_GRAPH_IRI, ProvOConstants } from "./ProvOConstants";

const $I = $KnowledgeServerId.create("Rdf/ProvenanceEmitter");

const KnowledgeGraphSchema = S.typeSchema(KnowledgeGraph);
type KnowledgeGraphModel = S.Schema.Type<typeof KnowledgeGraphSchema>;

const BEEP = {
  label: IRI.make(RDFS.label),
  hasExtractionId: IRI.make("urn:beep:hasExtractionId"),
  hasDocumentId: IRI.make("urn:beep:hasDocumentId"),
} as const;

const toEntityIri = (entityId: string): IRI.Type => IRI.make(`urn:beep:entity:${entityId}`);

const toExtractionGraphIri = (extractionId: KnowledgeEntityIds.ExtractionId.Type): IRI.Type =>
  IRI.make(`urn:beep:extraction:${extractionId}`);

const toActivityIri = (extractionId: KnowledgeEntityIds.ExtractionId.Type): IRI.Type =>
  IRI.make(`urn:beep:activity:${extractionId}`);

const toAgentIri = (userId: SharedEntityIds.UserId.Type): IRI.Type => IRI.make(`urn:beep:user:${userId}`);

const toDocumentIri = (documentId: DocumentsEntityIds.DocumentId.Type): IRI.Type =>
  IRI.make(`urn:beep:document:${documentId}`);

const toAttributePredicate = (raw: string): IRI.Type => {
  const trimmed = Str.trim(raw);
  if (Str.startsWith("http://")(trimmed) || Str.startsWith("https://")(trimmed) || Str.startsWith("urn:")(trimmed)) {
    return IRI.make(trimmed);
  }
  const encoded = encodeURIComponent(trimmed);
  return IRI.make(`urn:beep:attr:${encoded}`);
};

const dedupeQuads = (quads: ReadonlyArray<Quad>): ReadonlyArray<Quad> => {
  const seen = new Set<string>();
  const out = A.empty<Quad>();
  for (const quad of quads) {
    const objectPart = Literal.is(quad.object)
      ? `L:${quad.object.value}:${quad.object.datatype ?? ""}:${quad.object.language ?? ""}`
      : `T:${quad.object}`;
    const key = `${quad.subject}|${quad.predicate}|${objectPart}|${quad.graph ?? ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(quad);
    }
  }
  return out;
};

export class ProvenanceMetadata extends S.Class<ProvenanceMetadata>($I`ProvenanceMetadata`)({
  extractionId: KnowledgeEntityIds.ExtractionId,
  documentId: DocumentsEntityIds.DocumentId,
  actorUserId: SharedEntityIds.UserId,
  startedAt: BS.DateTimeUtcFromAllAcceptable,
  endedAt: BS.DateTimeUtcFromAllAcceptable,
}) {}

export class EmittedExtractionTriples extends S.Class<EmittedExtractionTriples>($I`EmittedExtractionTriples`)({
  extractionGraphIri: IRI,
  graphQuads: S.Array(Quad),
  provenanceGraphIri: IRI,
  provenanceQuads: S.Array(Quad),
}) {}

export interface ProvenanceEmitterShape {
  readonly emitExtraction: (
    graph: KnowledgeGraphModel,
    metadata: ProvenanceMetadata
  ) => Effect.Effect<EmittedExtractionTriples>;
}

export class ProvenanceEmitter extends Context.Tag($I`ProvenanceEmitter`)<
  ProvenanceEmitter,
  ProvenanceEmitterShape
>() {}

const serviceEffect: Effect.Effect<ProvenanceEmitterShape> = Effect.succeed(
  ProvenanceEmitter.of({
    emitExtraction: (
      graph: KnowledgeGraphModel,
      metadata: ProvenanceMetadata
    ): Effect.Effect<EmittedExtractionTriples> =>
      Effect.sync(() => {
        const extractionGraphIri = toExtractionGraphIri(metadata.extractionId);
        const activityIri = toActivityIri(metadata.extractionId);
        const agentIri = toAgentIri(metadata.actorUserId);
        const documentIri = toDocumentIri(metadata.documentId);

        const graphQuads = A.empty<Quad>();

        for (const entity of graph.entities) {
          const entityIri = toEntityIri(entity.id);

          for (const typeIri of entity.types) {
            graphQuads.push(
              new Quad({
                subject: entityIri,
                predicate: ProvOConstants.rdfType,
                object: IRI.make(typeIri),
                graph: extractionGraphIri,
              })
            );
          }

          graphQuads.push(
            new Quad({
              subject: entityIri,
              predicate: BEEP.label,
              object: new Literal({ value: entity.mention }),
              graph: extractionGraphIri,
            })
          );

          if (entity.canonicalName !== undefined) {
            graphQuads.push(
              new Quad({
                subject: entityIri,
                predicate: IRI.make("urn:beep:canonicalName"),
                object: new Literal({ value: entity.canonicalName }),
                graph: extractionGraphIri,
              })
            );
          }

          for (const [rawKey, rawValue] of Object.entries(entity.attributes)) {
            if (rawValue === undefined || rawValue === null) {
              continue;
            }
            graphQuads.push(
              new Quad({
                subject: entityIri,
                predicate: toAttributePredicate(rawKey),
                object: new Literal({ value: String(rawValue) }),
                graph: extractionGraphIri,
              })
            );
          }
        }

        for (const relation of graph.relations) {
          const subject = toEntityIri(relation.subjectId);
          const predicate = IRI.make(relation.predicate);

          if (relation.objectId !== undefined) {
            graphQuads.push(
              new Quad({
                subject,
                predicate,
                object: toEntityIri(relation.objectId),
                graph: extractionGraphIri,
              })
            );
            continue;
          }

          if (relation.literalValue !== undefined) {
            graphQuads.push(
              new Quad({
                subject,
                predicate,
                object:
                  relation.literalType !== undefined
                    ? new Literal({ value: relation.literalValue, datatype: IRI.make(relation.literalType) })
                    : new Literal({ value: relation.literalValue }),
                graph: extractionGraphIri,
              })
            );
          }
        }

        const provenanceQuads = A.empty<Quad>();

        provenanceQuads.push(
          new Quad({
            subject: activityIri,
            predicate: ProvOConstants.rdfType,
            object: ProvOConstants.Activity,
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: agentIri,
            predicate: ProvOConstants.rdfType,
            object: ProvOConstants.Agent,
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: documentIri,
            predicate: ProvOConstants.rdfType,
            object: ProvOConstants.Entity,
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: activityIri,
            predicate: ProvOConstants.wasAssociatedWith,
            object: agentIri,
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: activityIri,
            predicate: ProvOConstants.used,
            object: documentIri,
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: activityIri,
            predicate: ProvOConstants.startedAtTime,
            object: new Literal({
              value: DateTime.formatIso(metadata.startedAt),
              datatype: ProvOConstants.xsdDateTime,
            }),
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: activityIri,
            predicate: ProvOConstants.endedAtTime,
            object: new Literal({
              value: DateTime.formatIso(metadata.endedAt),
              datatype: ProvOConstants.xsdDateTime,
            }),
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: activityIri,
            predicate: BEEP.hasExtractionId,
            object: new Literal({ value: metadata.extractionId }),
            graph: PROVENANCE_GRAPH_IRI,
          }),
          new Quad({
            subject: activityIri,
            predicate: BEEP.hasDocumentId,
            object: new Literal({ value: metadata.documentId }),
            graph: PROVENANCE_GRAPH_IRI,
          })
        );

        for (const quad of graphQuads) {
          provenanceQuads.push(
            new Quad({
              subject: quad.subject,
              predicate: ProvOConstants.wasGeneratedBy,
              object: activityIri,
              graph: PROVENANCE_GRAPH_IRI,
            })
          );
        }

        return new EmittedExtractionTriples({
          extractionGraphIri,
          graphQuads: dedupeQuads(graphQuads),
          provenanceGraphIri: PROVENANCE_GRAPH_IRI,
          provenanceQuads: dedupeQuads(provenanceQuads),
        });
      }),
  })
);

export const ProvenanceEmitterLive = Layer.effect(ProvenanceEmitter, serviceEffect);
