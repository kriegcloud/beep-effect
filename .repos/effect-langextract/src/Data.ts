import { Effect, Layer, Ref, Schema } from "effect"

export const EXTRACTIONS_KEY = "extractions" as const
export const ATTRIBUTE_SUFFIX = "_attributes" as const

export const AlignmentStatus = Schema.Literal(
  "match_exact",
  "match_greater",
  "match_lesser",
  "match_fuzzy"
)
export type AlignmentStatus = typeof AlignmentStatus.Type

export class CharInterval extends Schema.Class<CharInterval>("CharInterval")({
  startPos: Schema.optionalWith(Schema.Int, { exact: true }),
  endPos: Schema.optionalWith(Schema.Int, { exact: true })
}) {}

export const TokenIntervalSchema = Schema.Struct({
  startIndex: Schema.Int,
  endIndex: Schema.Int
})
export type TokenIntervalSchema = typeof TokenIntervalSchema.Type

const ExtractionAttributes = Schema.Record({
  key: Schema.String,
  value: Schema.Union(Schema.String, Schema.Array(Schema.String))
})

export class Extraction extends Schema.Class<Extraction>("Extraction")({
  extractionClass: Schema.String,
  extractionText: Schema.String,
  charInterval: Schema.optionalWith(CharInterval, { exact: true }),
  alignmentStatus: Schema.optionalWith(AlignmentStatus, { exact: true }),
  extractionIndex: Schema.optionalWith(Schema.Int, { exact: true }),
  groupIndex: Schema.optionalWith(Schema.Int, { exact: true }),
  description: Schema.optionalWith(Schema.String, { exact: true }),
  attributes: Schema.optionalWith(ExtractionAttributes, { exact: true }),
  tokenInterval: Schema.optionalWith(TokenIntervalSchema, { exact: true })
}) {}

export class Document extends Schema.Class<Document>("Document")({
  text: Schema.String,
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  additionalContext: Schema.optionalWith(Schema.String, { exact: true })
}) {}

export interface DocumentIdGeneratorService {
  readonly next: Effect.Effect<string>
}

const makeDefaultDocumentIdGenerator = Effect.gen(function* () {
  const sequence = yield* Ref.make(0)
  return {
    next: Ref.updateAndGet(sequence, (value) => value + 1).pipe(
      Effect.map((value) => `doc_${value.toString(16).padStart(8, "0")}`)
    )
  } satisfies DocumentIdGeneratorService
})

export class DocumentIdGenerator extends Effect.Service<DocumentIdGenerator>()(
  "@effect-langextract/DocumentIdGenerator",
  {
    effect: makeDefaultDocumentIdGenerator
  }
) {
  static readonly Test: Layer.Layer<DocumentIdGenerator> = DocumentIdGenerator.Default

  static testLayer = (
    service?: DocumentIdGeneratorService
  ): Layer.Layer<DocumentIdGenerator> =>
    service !== undefined
      ? Layer.succeed(DocumentIdGenerator, DocumentIdGenerator.make(service))
      : DocumentIdGenerator.Default
}

export const makeDocument = (args: {
  readonly text: string
  readonly documentId?: string | undefined
  readonly additionalContext?: string | undefined
}): Document =>
  new Document({
    text: args.text,
    ...(args.documentId !== undefined ? { documentId: args.documentId } : {}),
    ...(args.additionalContext !== undefined
      ? { additionalContext: args.additionalContext }
      : {})
  })

export const makeDocumentEffect = (args: {
  readonly text: string
  readonly documentId?: string | undefined
  readonly additionalContext?: string | undefined
}): Effect.Effect<Document, never, DocumentIdGenerator> =>
  Effect.gen(function* () {
    const generator = yield* DocumentIdGenerator
    const documentId = args.documentId ?? (yield* generator.next)
    return makeDocument({
      text: args.text,
      documentId,
      ...(args.additionalContext !== undefined
        ? { additionalContext: args.additionalContext }
        : {})
    })
  })

export class AnnotatedDocument extends Schema.Class<AnnotatedDocument>("AnnotatedDocument")({
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  text: Schema.String,
  extractions: Schema.optionalWith(Schema.Array(Extraction), {
    default: () => []
  })
}) {}

export class ExampleData extends Schema.Class<ExampleData>("ExampleData")({
  text: Schema.String,
  extractions: Schema.optionalWith(Schema.Array(Extraction), {
    default: () => []
  }),
  input: Schema.optionalWith(Schema.String, { exact: true }),
  output: Schema.optionalWith(Schema.String, { exact: true })
}) {}
