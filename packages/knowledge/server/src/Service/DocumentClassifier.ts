import { $KnowledgeServerId } from "@beep/identity/packages";
import { FallbackLanguageModel } from "@beep/knowledge-server/LlmControl/FallbackLanguageModel";
import { withLlmResilienceWithFallback } from "@beep/knowledge-server/LlmControl/LlmResilience";
import { BS } from "@beep/schema";
import { LanguageModel, Prompt } from "@effect/ai";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $KnowledgeServerId.create("Service/DocumentClassifier");

const MAX_PREVIEW_SIZE = 1500;

export class DocumentType extends BS.StringLiteralKit(
  "article",
  "transcript",
  "report",
  "contract",
  "correspondence",
  "reference",
  "narrative",
  "structured",
  "unknown"
).annotations($I.annotations("DocumentType", { description: "Document structure/type classification" })) {}

export class EntityDensity extends BS.StringLiteralKit("sparse", "moderate", "dense").annotations(
  $I.annotations("EntityDensity", { description: "Estimated entity density" })
) {}

export class ClassificationError extends S.TaggedError<ClassificationError>($I`ClassificationError`)(
  "ClassificationError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ClassificationError", { description: "Document classifier failure" })
) {}

export class DocumentClassification extends S.Class<DocumentClassification>($I`DocumentClassification`)(
  {
    documentType: DocumentType,
    domainTags: S.Array(S.String),
    complexityScore: S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)),
    entityDensity: EntityDensity,

    // LLMs commonly emit null/undefined for optional fields; treat them as Option.none
    language: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
    title: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  },
  $I.annotations("DocumentClassification", {
    description:
      "LLM-produced classification for a document preview (type, tags, complexity, entity density, language, title).",
  })
) {}

export class ClassifyInput extends S.Class<ClassifyInput>($I`ClassifyInput`)(
  {
    preview: S.String,
    contentType: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  },
  $I.annotations("ClassifyInput", {
    description: "Single document classification request input (preview + optional content type hint).",
  })
) {}

class ClassifyBatchDocumentInput extends S.Class<ClassifyBatchDocumentInput>($I`ClassifyBatchDocumentInput`)(
  {
    index: S.Int,
    preview: S.String,
    contentType: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  },
  $I.annotations("ClassifyBatchDocumentInput", {
    description: "Single item in a batch classification request (index + preview + optional content type hint).",
  })
) {}

export class ClassifyBatchInput extends S.Class<ClassifyBatchInput>($I`ClassifyBatchInput`)(
  {
    documents: S.Array(ClassifyBatchDocumentInput),
  },
  $I.annotations("ClassifyBatchInput", {
    description: "Batch document classification request input (array of indexed previews).",
  })
) {}

class BatchClassificationItem extends S.Class<BatchClassificationItem>($I`BatchClassificationItem`)(
  {
    index: S.Int,
    classification: DocumentClassification,
  },
  $I.annotations("BatchClassificationItem", {
    description: "Single classification result item (document index + classification).",
  })
) {}

class BatchClassificationResponse extends S.Class<BatchClassificationResponse>($I`BatchClassificationResponse`)(
  {
    classifications: S.Array(BatchClassificationItem),
  },
  $I.annotations("BatchClassificationResponse", {
    description: "Batch classification response wrapper returned by the LLM (array of classification items).",
  })
) {}

export const defaultClassification = new DocumentClassification({
  documentType: "unknown",
  domainTags: [],
  complexityScore: 0.5,
  entityDensity: "moderate",
  language: O.some("en"),
  title: O.none(),
});

const buildSinglePrompt = (preview: string, contentType: O.Option<string>): string => {
  const truncated = preview.slice(0, MAX_PREVIEW_SIZE);
  const typeHint = O.match(contentType, { onNone: () => "", onSome: (t) => ` (${t})` });

  return `You are a document classification assistant. Analyze the following document preview and classify it.

Determine:
1. documentType: The structural type (article, transcript, report, contract, correspondence, reference, narrative, structured, unknown)
2. domainTags: 2-5 topic tags describing what the document is about
3. complexityScore: How complex is the language/structure? (0=very simple, 1=highly technical/complex)
4. entityDensity: How many named entities per paragraph? (sparse, moderate, dense)
5. language: ISO 639-1 code if detectable (e.g., "en", "es")
6. title: Document title if visible

Document${typeHint}:
"""${truncated}"""

Respond with the classification.`;
};

const buildBatchPrompt = (
  docs: ReadonlyArray<{ readonly index: number; readonly preview: string; readonly contentType: O.Option<string> }>
): string => {
  const summaries = A.map(docs, ({ contentType, index, preview }) => {
    const typeHint = O.match(contentType, { onNone: () => "", onSome: (t) => ` (${t})` });
    return `Document ${index}${typeHint}:\n"""${preview.slice(0, MAX_PREVIEW_SIZE)}"""`;
  }).join("\n\n---\n\n");

  return `You are a document classification assistant. Analyze the following document previews and classify each one.

For each document, determine:
1. documentType: The structural type (article, transcript, report, contract, correspondence, reference, narrative, structured, unknown)
2. domainTags: 2-5 topic tags describing what the document is about
3. complexityScore: How complex is the language/structure? (0=very simple, 1=highly technical/complex)
4. entityDensity: How many named entities per paragraph? (sparse, moderate, dense)
5. language: ISO 639-1 code if detectable (e.g., "en", "es")
6. title: Document title if visible

${summaries}

Respond with classifications for each document by index.`;
};

export interface DocumentClassifierShape {
  readonly classify: (input: ClassifyInput) => Effect.Effect<DocumentClassification, ClassificationError>;
  readonly classifyBatch: (
    input: ClassifyBatchInput
  ) => Effect.Effect<
    ReadonlyArray<{ readonly index: number; readonly classification: DocumentClassification }>,
    ClassificationError
  >;
}

export class DocumentClassifier extends Context.Tag($I`DocumentClassifier`)<
  DocumentClassifier,
  DocumentClassifierShape
>() {}

const serviceEffect: Effect.Effect<
  DocumentClassifierShape,
  never,
  LanguageModel.LanguageModel | FallbackLanguageModel
> = Effect.gen(function* () {
  const model = yield* LanguageModel.LanguageModel;
  const fallback = yield* FallbackLanguageModel;

  return DocumentClassifier.of({
    classify: (input) =>
      withLlmResilienceWithFallback(
        model,
        fallback,
        (llm) =>
          llm.generateObject({
            prompt: Prompt.make(buildSinglePrompt(input.preview, input.contentType)),
            schema: DocumentClassification,
            objectName: "DocumentClassification",
          }),
        {
          stage: "entity_extraction",
          estimatedTokens: Str.length(input.preview),
          maxRetries: 1,
          baseRetryDelay: Duration.zero,
        }
      ).pipe(
        Effect.map((r) => r.value),
        Effect.mapError(
          (e) =>
            new ClassificationError({
              message: `Document classification failed: ${String(e)}`,
              cause: e,
            })
        )
      ),

    classifyBatch: (input) =>
      withLlmResilienceWithFallback(
        model,
        fallback,
        (llm) =>
          llm.generateObject({
            prompt: Prompt.make(
              buildBatchPrompt(
                A.map(input.documents, (d) => ({
                  index: d.index,
                  preview: d.preview,
                  contentType: d.contentType,
                }))
              )
            ),
            schema: BatchClassificationResponse,
            objectName: "BatchClassificationResponse",
          }),
        {
          stage: "entity_extraction",
          estimatedTokens: A.reduce(input.documents, 0, (acc, d) => acc + Str.length(d.preview)),
          maxRetries: 1,
          baseRetryDelay: Duration.zero,
        }
      ).pipe(
        Effect.map((r) => r.value.classifications),
        Effect.mapError(
          (e) =>
            new ClassificationError({
              message: `Batch classification failed: ${String(e)}`,
              cause: e,
            })
        )
      ),
  });
});

export const DocumentClassifierLive = Layer.effect(DocumentClassifier, serviceEffect);
