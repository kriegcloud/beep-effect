import { Schema } from "effect"

export class LangExtractError extends Schema.TaggedError<LangExtractError>()(
  "LangExtractError",
  {
    message: Schema.String
  }
) {}

export class InferenceConfigError extends Schema.TaggedError<InferenceConfigError>()(
  "InferenceConfigError",
  {
    message: Schema.String
  }
) {}

export class InferenceRuntimeError extends Schema.TaggedError<InferenceRuntimeError>()(
  "InferenceRuntimeError",
  {
    message: Schema.String,
    provider: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

export class InferenceOutputError extends Schema.TaggedError<InferenceOutputError>()(
  "InferenceOutputError",
  {
    message: Schema.String
  }
) {}

export class InvalidDocumentError extends Schema.TaggedError<InvalidDocumentError>()(
  "InvalidDocumentError",
  {
    message: Schema.String
  }
) {}

export class InternalError extends Schema.TaggedError<InternalError>()(
  "InternalError",
  {
    message: Schema.String
  }
) {}

export class ProviderError extends Schema.TaggedError<ProviderError>()(
  "ProviderError",
  {
    message: Schema.String
  }
) {}

export class PrimedCacheError extends Schema.TaggedError<PrimedCacheError>()(
  "PrimedCacheError",
  {
    message: Schema.String,
    key: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

export class ProviderRateLimitError extends Schema.TaggedError<ProviderRateLimitError>()(
  "ProviderRateLimitError",
  {
    message: Schema.String,
    provider: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

export class SchemaValidationError extends Schema.TaggedError<SchemaValidationError>()(
  "SchemaValidationError",
  {
    message: Schema.String
  }
) {}

export class FormatError extends Schema.TaggedError<FormatError>()(
  "FormatError",
  {
    message: Schema.String
  }
) {}

export class FormatParseError extends Schema.TaggedError<FormatParseError>()(
  "FormatParseError",
  {
    message: Schema.String
  }
) {}

export class ResolverParsingError extends Schema.TaggedError<ResolverParsingError>()(
  "ResolverParsingError",
  {
    message: Schema.String
  }
) {}

export class AlignmentError extends Schema.TaggedError<AlignmentError>()(
  "AlignmentError",
  {
    message: Schema.String
  }
) {}

export class TokenizerError extends Schema.TaggedError<TokenizerError>()(
  "TokenizerError",
  {
    message: Schema.String
  }
) {}

export class InvalidTokenIntervalError extends Schema.TaggedError<InvalidTokenIntervalError>()(
  "InvalidTokenIntervalError",
  {
    message: Schema.String
  }
) {}

export class SentenceRangeError extends Schema.TaggedError<SentenceRangeError>()(
  "SentenceRangeError",
  {
    message: Schema.String
  }
) {}

export class TokenUtilError extends Schema.TaggedError<TokenUtilError>()(
  "TokenUtilError",
  {
    message: Schema.String
  }
) {}

export class PromptBuilderError extends Schema.TaggedError<PromptBuilderError>()(
  "PromptBuilderError",
  {
    message: Schema.String
  }
) {}

export class PromptParseError extends Schema.TaggedError<PromptParseError>()(
  "PromptParseError",
  {
    message: Schema.String
  }
) {}

export class PromptAlignmentError extends Schema.TaggedError<PromptAlignmentError>()(
  "PromptAlignmentError",
  {
    message: Schema.String
  }
) {}

export class InvalidDatasetError extends Schema.TaggedError<InvalidDatasetError>()(
  "InvalidDatasetError",
  {
    message: Schema.String
  }
) {}

export class VisualizationError extends Schema.TaggedError<VisualizationError>()(
  "VisualizationError",
  {
    message: Schema.String
  }
) {}

export class IoError extends Schema.TaggedError<IoError>()(
  "IoError",
  {
    message: Schema.String
  }
) {}

export class IngestionConfigError extends Schema.TaggedError<IngestionConfigError>()(
  "IngestionConfigError",
  {
    message: Schema.String
  }
) {}

export class IngestionSourceError extends Schema.TaggedError<IngestionSourceError>()(
  "IngestionSourceError",
  {
    message: Schema.String,
    sourceTag: Schema.optionalWith(Schema.Literal("text", "file", "url", "stdin"), {
      exact: true
    }),
    sourceRef: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

export class IngestionFormatError extends Schema.TaggedError<IngestionFormatError>()(
  "IngestionFormatError",
  {
    message: Schema.String,
    format: Schema.optionalWith(Schema.String, { exact: true }),
    sourceTag: Schema.optionalWith(Schema.Literal("text", "file", "url", "stdin"), {
      exact: true
    }),
    sourceRef: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

export class IngestionDecodeError extends Schema.TaggedError<IngestionDecodeError>()(
  "IngestionDecodeError",
  {
    message: Schema.String,
    format: Schema.optionalWith(Schema.String, { exact: true }),
    sourceTag: Schema.optionalWith(Schema.Literal("text", "file", "url", "stdin"), {
      exact: true
    }),
    sourceRef: Schema.optionalWith(Schema.String, { exact: true }),
    rowIndex: Schema.optionalWith(Schema.Int, { exact: true }),
    lineNumber: Schema.optionalWith(Schema.Int, { exact: true })
  }
) {}

export class IngestionMappingError extends Schema.TaggedError<IngestionMappingError>()(
  "IngestionMappingError",
  {
    message: Schema.String,
    sourceTag: Schema.optionalWith(Schema.Literal("file", "url", "stdin"), {
      exact: true
    }),
    sourceRef: Schema.optionalWith(Schema.String, { exact: true }),
    rowIndex: Schema.optionalWith(Schema.Int, { exact: true }),
    lineNumber: Schema.optionalWith(Schema.Int, { exact: true })
  }
) {}

export class IngestionEmptyInputError extends Schema.TaggedError<IngestionEmptyInputError>()(
  "IngestionEmptyInputError",
  {
    message: Schema.String,
    sourceTag: Schema.optionalWith(Schema.Literal("text", "file", "url", "stdin"), {
      exact: true
    }),
    sourceRef: Schema.optionalWith(Schema.String, { exact: true })
  }
) {}

export type AnyLangExtractError =
  | LangExtractError
  | InferenceConfigError
  | InferenceRuntimeError
  | InferenceOutputError
  | InvalidDocumentError
  | InternalError
  | ProviderError
  | PrimedCacheError
  | ProviderRateLimitError
  | SchemaValidationError
  | FormatError
  | FormatParseError
  | ResolverParsingError
  | AlignmentError
  | TokenizerError
  | InvalidTokenIntervalError
  | SentenceRangeError
  | TokenUtilError
  | PromptBuilderError
  | PromptParseError
  | PromptAlignmentError
  | InvalidDatasetError
  | VisualizationError
  | IoError
  | IngestionConfigError
  | IngestionSourceError
  | IngestionFormatError
  | IngestionDecodeError
  | IngestionMappingError
  | IngestionEmptyInputError
