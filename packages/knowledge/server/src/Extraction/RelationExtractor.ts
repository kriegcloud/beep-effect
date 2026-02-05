import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel, Prompt } from "@effect/ai";
import type * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { buildRelationPrompt, buildSystemPrompt } from "../Ai/PromptTemplates";
import type { TextChunk } from "../Nlp/TextChunk";
import type { OntologyContext } from "../Ontology";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import { ExtractedTriple, RelationOutput } from "./schemas/relation-output.schema";

const $I = $KnowledgeServerId.create("knowledge-server/Extraction/RelationExtractor");

export interface RelationExtractionConfig {
  readonly minConfidence?: undefined | number;
  readonly validatePredicates?: undefined | boolean;
}

export interface RelationExtractionResult {
  readonly triples: readonly ExtractedTriple[];
  readonly invalidTriples: readonly ExtractedTriple[];
  readonly tokensUsed: number;
}

export interface RelationExtractorShape {
  readonly extract: (
    entities: readonly ClassifiedEntity[],
    chunk: TextChunk,
    ontologyContext: OntologyContext,
    config?: undefined | RelationExtractionConfig
  ) => Effect.Effect<RelationExtractionResult, AiError.AiError | HttpServerError.RequestError>;
  readonly extractFromChunks: (
    entitiesByChunk: MutableHashMap.MutableHashMap<number, readonly ClassifiedEntity[]>,
    chunks: readonly TextChunk[],
    ontologyContext: OntologyContext,
    config?: undefined | RelationExtractionConfig
  ) => Effect.Effect<RelationExtractionResult, AiError.AiError | HttpServerError.RequestError>;
  readonly deduplicateRelations: (
    triples: readonly ExtractedTriple[]
  ) => Effect.Effect<readonly ExtractedTriple[], never>;
}

export class RelationExtractor extends Context.Tag($I`RelationExtractor`)<
  RelationExtractor,
  RelationExtractorShape
>() {}

const serviceEffect: Effect.Effect<RelationExtractorShape, never, LanguageModel.LanguageModel> = Effect.gen(
  function* () {
    const model = yield* LanguageModel.LanguageModel;

    const partitionByPredicateValidity = (
      triples: readonly ExtractedTriple[],
      ontologyContext: OntologyContext
    ): { readonly valid: readonly ExtractedTriple[]; readonly invalid: readonly ExtractedTriple[] } => {
      const [invalid, valid] = A.partition(triples, (triple) =>
        O.isSome(ontologyContext.findProperty(triple.predicateIri))
      );
      return { valid, invalid };
    };

    const adjustOffsets = (triple: ExtractedTriple, chunkOffset: number): ExtractedTriple => {
      if (triple.evidenceStartChar === undefined || triple.evidenceEndChar === undefined) {
        return triple;
      }
      return new ExtractedTriple({
        ...triple,
        evidenceStartChar: triple.evidenceStartChar + chunkOffset,
        evidenceEndChar: triple.evidenceEndChar + chunkOffset,
      });
    };

    const tripleDeduplicationKey = (triple: ExtractedTriple): string => {
      const objectPart = triple.objectMention ?? triple.literalValue ?? "";
      return Str.toLowerCase([triple.subjectMention, triple.predicateIri, objectPart].join("|"));
    };

    const extract = Effect.fnUntraced(function* (
      entities: readonly ClassifiedEntity[],
      chunk: TextChunk,
      ontologyContext: OntologyContext,
      config: RelationExtractionConfig = {}
    ) {
      const minConfidence = config.minConfidence ?? 0.5;
      const shouldValidate = config.validatePredicates ?? true;

      if (A.isEmptyReadonlyArray(entities)) {
        yield* Effect.logDebug("Skipping relation extraction - insufficient entities", {
          entityCount: A.length(entities),
        });

        return {
          triples: A.empty<ExtractedTriple>(),
          invalidTriples: A.empty<ExtractedTriple>(),
          tokensUsed: 0,
        };
      }

      yield* Effect.logDebug("Extracting relations", {
        entityCount: A.length(entities),
        chunkIndex: chunk.index,
        propertyCount: A.length(ontologyContext.properties),
      });

      const prompt = Prompt.make([
        Prompt.systemMessage({ content: buildSystemPrompt() }),
        Prompt.userMessage({
          content: A.make(
            Prompt.textPart({
              text: buildRelationPrompt([...entities], chunk.text, ontologyContext),
            })
          ),
        }),
      ]);

      const result = yield* model.generateObject({
        prompt,
        schema: RelationOutput,
        objectName: "RelationOutput",
      });

      const tokensUsed = (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0);

      const offsetAdjusted = F.pipe(
        result.value.triples,
        A.filter((t) => t.confidence >= minConfidence),
        A.map((t) => adjustOffsets(t, chunk.startOffset))
      );

      const { valid, invalid } = shouldValidate
        ? partitionByPredicateValidity(offsetAdjusted, ontologyContext)
        : { valid: offsetAdjusted, invalid: A.empty<ExtractedTriple>() };

      yield* Effect.logDebug("Relation extraction complete", {
        validTriples: A.length(valid),
        invalidTriples: A.length(invalid),
        tokensUsed,
      });

      return { triples: valid, invalidTriples: invalid, tokensUsed };
    });

    const extractFromChunks = Effect.fnUntraced(function* (
      entitiesByChunk: MutableHashMap.MutableHashMap<number, readonly ClassifiedEntity[]>,
      chunks: readonly TextChunk[],
      ontologyContext: OntologyContext,
      config: RelationExtractionConfig = {}
    ) {
      const allTriples = A.empty<ExtractedTriple>();
      const allInvalid = A.empty<ExtractedTriple>();
      let totalTokens = 0;

      const minConfidence = config.minConfidence ?? 0.5;
      const shouldValidate = config.validatePredicates ?? true;

      for (const chunk of chunks) {
        const entities = F.pipe(
          MutableHashMap.get(entitiesByChunk, chunk.index),
          O.getOrElse(() => A.empty<ClassifiedEntity>())
        );

        if (A.isEmptyReadonlyArray(entities)) continue;

        const prompt = Prompt.make([
          Prompt.systemMessage({ content: buildSystemPrompt() }),
          Prompt.userMessage({
            content: A.make(
              Prompt.textPart({
                text: buildRelationPrompt([...entities], chunk.text, ontologyContext),
              })
            ),
          }),
        ]);

        const aiResult = yield* model.generateObject({
          prompt,
          schema: RelationOutput,
          objectName: "RelationOutput",
        });

        const offsetAdjusted = F.pipe(
          aiResult.value.triples,
          A.filter((t) => t.confidence >= minConfidence),
          A.map((t) => adjustOffsets(t, chunk.startOffset))
        );

        if (shouldValidate) {
          const { valid, invalid } = partitionByPredicateValidity(offsetAdjusted, ontologyContext);
          allTriples.push(...valid);
          allInvalid.push(...invalid);
        } else {
          allTriples.push(...offsetAdjusted);
        }

        totalTokens += (aiResult.usage.inputTokens ?? 0) + (aiResult.usage.outputTokens ?? 0);
      }

      yield* Effect.logInfo("Relation extraction from chunks complete", {
        chunkCount: A.length(chunks),
        totalTriples: A.length(allTriples),
        invalidTriples: A.length(allInvalid),
        tokensUsed: totalTokens,
      });

      return { triples: allTriples, invalidTriples: allInvalid, tokensUsed: totalTokens };
    });

    const deduplicateRelations = (
      triples: readonly ExtractedTriple[]
    ): Effect.Effect<readonly ExtractedTriple[], never> =>
      Effect.sync(() => {
        const seen = A.reduce(triples, MutableHashMap.empty<string, ExtractedTriple>(), (acc, triple) => {
          const key = tripleDeduplicationKey(triple);
          const existingOpt = MutableHashMap.get(acc, key);
          if (O.isNone(existingOpt) || triple.confidence > existingOpt.value.confidence) {
            MutableHashMap.set(acc, key, triple);
          }
          return acc;
        });

        const result = A.empty<ExtractedTriple>();
        MutableHashMap.forEach(seen, (triple) => {
          result.push(triple);
        });
        return result;
      });

    return RelationExtractor.of({ extract, extractFromChunks, deduplicateRelations });
  }
);

export const RelationExtractorLive = Layer.effect(RelationExtractor, serviceEffect);
