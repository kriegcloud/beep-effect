/**
 * Zero-dependency YAML 1.2 parsing, editing and formatting as Effect schemas.
 *
 * **Details**
 *
 * {@link Yaml} is the value-level facade (`parse`/`parseAll`/`stringify`,
 * comment stripping, semantic equality and the schema factories);
 * {@link YamlDocument} exposes the full parsed AST plus recovered
 * diagnostics; {@link YamlFormat} computes non-mutating format/modify edits
 * that preserve comments and whitespace; {@link YamlVisitor} streams
 * SAX-style AST events; {@link YamlTokens} exposes the positioned token
 * stream; {@link YamlLint} runs style rules, applies their fixes and infers a
 * config from observed style. All fallible entry points — parse, stringify, encode
 * and modify — carry typed errors built from {@link YamlDiagnostic}, never a
 * collapsed string reason or an unhandled defect on malformed or adversarial
 * input.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export {
  Yaml,
  YamlParseError,
  YamlParseOptions,
  YamlStringifyError,
  YamlStringifyOptions,
} from "./Yaml.ts";
export {
  YamlComposerErrorCode,
  YamlDiagnostic,
  YamlErrorCode,
  YamlLexErrorCode,
  YamlModifyErrorCode,
  YamlParseErrorCode,
  YamlStringifyErrorCode,
} from "./YamlDiagnostic.ts";
export { YamlDirective, YamlDocument } from "./YamlDocument.ts";
export { YamlEdit, YamlRange } from "./YamlEdit.ts";
export { YamlFormat, YamlFormattingOptions, YamlModificationError } from "./YamlFormat.ts";
export {
  StyleConflict,
  StyleEvidence,
  StyleFloorTally,
  StyleVoteTally,
  YamlLint,
  YamlLintConfig,
  YamlLintInference,
  YamlLintRuleSetting,
  YamlStyleConflictError,
} from "./YamlLint.ts";
export {
  LintContext,
  LintLine,
  StyleFloor,
  StyleVote,
  YamlLintDiagnostic,
  YamlLintSeverity,
  YamlRule,
} from "./YamlLintRule.ts";
export {
  CollectionStyle,
  QuoteCompat,
  QuoteStyle,
  ScalarChomp,
  ScalarStyle,
  YamlAlias,
  YamlMap,
  YamlNode,
  YamlNodeBase,
  YamlPair,
  YamlScalar,
  YamlSeq,
} from "./YamlNode.ts";
export { YamlToken, YamlTokenKind, YamlTokens } from "./YamlToken.ts";
export { YamlVisitor, YamlVisitorEvent } from "./YamlVisitor.ts";
export type { YamlBoundCodec } from "./Yaml.ts";
export type { YamlPath, YamlSegment } from "./YamlEdit.ts";
export type { YamlRangeLike } from "./YamlFormat.ts";
export type { StyleObservation } from "./YamlLintRule.ts";
