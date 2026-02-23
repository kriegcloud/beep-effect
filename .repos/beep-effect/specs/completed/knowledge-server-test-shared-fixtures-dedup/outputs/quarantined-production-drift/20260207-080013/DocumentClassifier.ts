import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel } from "@effect/ai";
import * as Prompt from "@effect/ai/Prompt";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { withLlmResilience } from "../LlmControl/LlmResilience";

const $I = $KnowledgeServerId.create("Service/DocumentClassifier");

const MAX_PREVIEW_SIZE = 1500;

export const DocumentClassification = S.Struct({
  documentType: S.Literal(
    "article",
    "transcript",
    "report",
    "contract",
    "correspondence",
    "reference",
    "narrative",
    "structured",
    "unknown"
  ),
  domainTags: S.Array(S.String),
  complexityScore: S.Number.pipe(S.between(0, 1)),
  entityDensity: S.Literal("sparse", "moderate", "dense"),
  language: S.optional(S.String),
  title: S.optional(S.String),
});

export type DocumentClassification = S.Schema.Type<typeof DocumentClassification>;

export const BatchClassificationResponse = S.Struct({
  classifications: S.Array(
    S.Struct({
      index: S.NonNegativeInt,
      classification: DocumentClassification,
    })
  ),
});

export type BatchClassificationResponse = S.Schema.Type<typeof BatchClassificationResponse>;

export const ClassifyInput = S.Struct({
  preview: S.String,
  contentType: S.optional(S.String),
});

export type ClassifyInput = S.Schema.Type<typeof ClassifyInput>;

export const ClassifyBatchInput = S.Struct({
  documents: S.Array(
    S.Struct({
      index: S.NonNegativeInt,
      preview: S.String,
      contentType: S.optional(S.String),
    })
  ),
});

export type ClassifyBatchInput = S.Schema.Type<typeof ClassifyBatchInput>;

export class DocumentClassificationError extends S.TaggedError<DocumentClassificationError>()("DocumentClassificationError", {
  message: S.String,
  cause: S.optional(S.Defect),
}) {}

export const defaultClassification: DocumentClassification = {
  documentType: "unknown",
  domainTags: [],
  complexityScore: 0.5,
  entityDensity: "moderate",
  language: "en",
};

const buildSinglePrompt = (preview: string, contentType?: string): string => {
  const truncated = Str.slice(0, MAX_PREVIEW_SIZE)(preview);
  const typeHint = contentType ? ` (${contentType})` : "";

  return `You are a document classification assistant. Analyze the following document preview and classify it.

Determine:
1. documentType: article, transcript, report, contract, correspondence, reference, narrative, structured, unknown
2. domainTags: 2-5 topic tags describing the document topic (empty array if unclear)
3. complexityScore: 0-1 (0=simple, 1=highly technical)
4. entityDensity: sparse, moderate, dense
5. language: ISO 639-1 code if detectable (e.g. "en", "es")
6. title: document title if visible

Document${typeHint}:
"""${truncated}"""

Respond with the classification as JSON.`;
};

const buildBatchPrompt = (documents: ReadonlyArray<{ index: number; preview: string; contentType?: string }>): string => {
  const summaries = A.map(documents, ({ index, preview, contentType }) => {
    const truncated = Str.slice(0, MAX_PREVIEW_SIZE)(preview);
    const typeHint = contentType ? ` (${contentType})` : "";
    return `Document ${index}${typeHint}:\n"""${truncated}"""`;
  });

  return `You are a document classification assistant. Analyze the following document previews and classify each one.

For each document, determine:
1. documentType: article, transcript, report, contract, correspondence, reference, narrative, structured, unknown
2. domainTags: 2-5 topic tags describing the document topic (empty array if unclear)
3. complexityScore: 0-1 (0=simple, 1=highly technical)
4. entityDensity: sparse, moderate, dense
5. language: ISO 639-1 code if detectable (e.g. "en", "es")
6. title: document title if visible

${A.join(summaries, "\n\n---\n\n")}

Respond with classifications for each document by index as JSON.`;
};

export interface DocumentClassifierShape {
  readonly classify: (input: ClassifyInput) => Effect.Effect<DocumentClassification, DocumentClassificationError>;
  readonly classifyBatch: (input: ClassifyBatchInput) => Effect.Effect<BatchClassificationResponse, DocumentClassificationError>;
}

export class DocumentClassifier extends Context.Tag($I`DocumentClassifier`)<
  DocumentClassifier,
  DocumentClassifierShape
>() {}

const serviceEffect: Effect.Effect<DocumentClassifierShape, never, LanguageModel.LanguageModel> = Effect.gen(function* () {
  const model = yield* LanguageModel.LanguageModel;

  const classify: DocumentClassifierShape["classify"] = (input) =>
    withLlmResilience(
      model.generateObject({
        prompt: Prompt.make([
          Prompt.systemMessage({ content: "You are a precise JSON-only assistant." }),
          Prompt.userMessage({
            content: A.make(
              Prompt.textPart({
                text: buildSinglePrompt(input.preview, input.contentType),
              })
            ),
          }),
        ]),
        schema: DocumentClassification,
        objectName: "DocumentClassification",
      }),
      {
        stage: "chunking",
        estimatedTokens: Str.length(input.preview),
        maxRetries: 1,
      }
    ).pipe(
      Effect.map((r) => r.value),
      Effect.mapError(
        (cause) =>
          new DocumentClassificationError({
            message: `Document classification failed: ${String(cause)}`,
            cause,
          })
      ),
      Effect.withSpan("DocumentClassifier.classify", {
        captureStackTrace: false,
        attributes: {
          contentType: input.contentType ?? "unknown",
          previewLength: Str.length(input.preview),
        },
      })
    );

  const classifyBatch: DocumentClassifierShape["classifyBatch"] = (input) =>
    withLlmResilience(
      model.generateObject({
        prompt: Prompt.make([
          Prompt.systemMessage({ content: "You are a precise JSON-only assistant." }),
          Prompt.userMessage({
            content: A.make(
              Prompt.textPart({
                text: buildBatchPrompt(input.documents),
              })
            ),
          }),
        ]),
        schema: BatchClassificationResponse,
        objectName: "BatchClassificationResponse",
      }),
      {
        stage: "chunking",
        estimatedTokens: A.reduce(input.documents, 0, (acc, doc) => acc + Str.length(doc.preview)),
        maxRetries: 1,
      }
    ).pipe(
      Effect.map((r) => r.value),
      Effect.mapError(
        (cause) =>
          new DocumentClassificationError({
            message: `Batch document classification failed: ${String(cause)}`,
            cause,
          })
      ),
      Effect.withSpan("DocumentClassifier.classifyBatch", {
        captureStackTrace: false,
        attributes: {
          documentCount: A.length(input.documents),
        },
      })
    );

  return DocumentClassifier.of({ classify, classifyBatch });
});

export const DocumentClassifierLive = Layer.effect(DocumentClassifier, serviceEffect);

