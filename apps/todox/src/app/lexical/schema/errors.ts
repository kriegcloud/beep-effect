/**
 * Tagged error classes for Lexical utilities.
 *
 * @since 0.1.0
 */
import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $TodoxId.create("lexical/schema/errors");

/**
 * Error thrown when URL validation or sanitization fails.
 *
 * @since 0.1.0
 */
export class InvalidUrlError extends S.TaggedError<InvalidUrlError>()(
  $I`InvalidUrlError`,
  {
    message: S.String,
    url: S.String,
  },
  $I.annotations("InvalidUrlError", {
    description: "Error thrown when URL validation or sanitization fails",
  })
) {}

/**
 * Error thrown when document hash validation fails.
 *
 * @since 0.1.0
 */
export class InvalidDocumentHashError extends S.TaggedError<InvalidDocumentHashError>()(
  $I`InvalidDocumentHashError`,
  {
    message: S.String,
    hash: S.String,
  },
  $I.annotations("InvalidDocumentHashError", {
    description: "Error thrown when document hash validation fails",
  })
) {}

/**
 * Error thrown when compression or decompression fails.
 *
 * @since 0.1.0
 */
export class CompressionError extends S.TaggedError<CompressionError>()(
  $I`CompressionError`,
  {
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("CompressionError", {
    description: "Error thrown when compression or decompression fails",
  })
) {}

/**
 * Error thrown when clipboard operations fail.
 *
 * @since 0.1.0
 */
export class ClipboardError extends S.TaggedError<ClipboardError>()(
  $I`ClipboardError`,
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("ClipboardError", {
    description: "Error thrown when clipboard operations fail",
  })
) {}

/**
 * Error thrown when Prettier formatting fails.
 *
 * @since 0.1.0
 */
export class PrettierError extends S.TaggedError<PrettierError>()(
  $I`PrettierError`,
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("PrettierError", {
    description: "Error thrown when Prettier formatting fails",
  })
) {}

/**
 * Error thrown when Prettier doesn't support a language.
 *
 * @since 0.1.0
 */
export class UnsupportedLanguageError extends S.TaggedError<UnsupportedLanguageError>()(
  $I`UnsupportedLanguageError`,
  {
    message: S.String,
    lang: S.String,
  },
  $I.annotations("UnsupportedLanguageError", {
    description: "Error thrown when Prettier doesn't support a language",
  })
) {}

/**
 * Error thrown when Twitter widget operations fail.
 *
 * @since 0.1.0
 */
export class TwitterError extends S.TaggedError<TwitterError>()(
  $I`TwitterError`,
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("TwitterError", {
    description: "Error thrown when Twitter widget operations fail",
  })
) {}

/**
 * Error thrown when a required Lexical node is not registered.
 *
 * @since 0.1.0
 */
export class NodeNotRegisteredError extends S.TaggedError<NodeNotRegisteredError>()(
  $I`NodeNotRegisteredError`,
  {
    message: S.String,
    plugin: S.String,
    nodeType: S.String,
  },
  $I.annotations("NodeNotRegisteredError", {
    description: "Error thrown when a required Lexical node is not registered",
  })
) {}

/**
 * Error thrown when a DOM element is not found.
 *
 * @since 0.1.0
 */
export class DomElementNotFoundError extends S.TaggedError<DomElementNotFoundError>()(
  $I`DomElementNotFoundError`,
  {
    message: S.String,
    elementType: S.String,
  },
  $I.annotations("DomElementNotFoundError", {
    description: "Error thrown when a DOM element is not found",
  })
) {}

/**
 * Error thrown when a required React context is missing.
 *
 * @since 0.1.0
 */
export class MissingContextError extends S.TaggedError<MissingContextError>()(
  $I`MissingContextError`,
  {
    message: S.String,
    contextName: S.String,
  },
  $I.annotations("MissingContextError", {
    description: "Error thrown when a required React context is missing",
  })
) {}

/**
 * Error thrown when a theme property is not defined.
 *
 * @since 0.1.0
 */
export class ThemePropertyError extends S.TaggedError<ThemePropertyError>()(
  $I`ThemePropertyError`,
  {
    message: S.String,
    propertyName: S.String,
  },
  $I.annotations("ThemePropertyError", {
    description: "Error thrown when a theme property is not defined",
  })
) {}

/**
 * Error thrown when a canvas 2D context is not available.
 *
 * @since 0.1.0
 */
export class Canvas2DContextError extends S.TaggedError<Canvas2DContextError>()(
  $I`Canvas2DContextError`,
  {
    message: S.String,
  },
  $I.annotations("Canvas2DContextError", {
    description: "Error thrown when a canvas 2D context is not available",
  })
) {}

/**
 * Error thrown when table cell operations fail.
 *
 * @since 0.1.0
 */
export class TableCellError extends S.TaggedError<TableCellError>()(
  $I`TableCellError`,
  {
    message: S.String,
    operation: S.String,
  },
  $I.annotations("TableCellError", {
    description: "Error thrown when table cell operations fail",
  })
) {}

/**
 * Error thrown when collapsible plugin operations fail.
 *
 * @since 0.1.0
 */
export class CollapsibleError extends S.TaggedError<CollapsibleError>()(
  $I`CollapsibleError`,
  {
    message: S.String,
    nodeType: S.String,
  },
  $I.annotations("CollapsibleError", {
    description: "Error thrown when collapsible plugin operations fail",
  })
) {}
