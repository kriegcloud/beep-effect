import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/sparql");

export class SparqlSyntaxError extends S.TaggedError<SparqlSyntaxError>($I`SparqlSyntaxError`)(
  "SparqlSyntaxError",
  {
    query: S.String,
    message: S.String,
    line: S.optional(S.Number),
    column: S.optional(S.Number),
  },
  $I.annotations("SparqlSyntaxError", {
    description: "SPARQL query has invalid syntax",
  })
) {}

export class SparqlTimeoutError extends S.TaggedError<SparqlTimeoutError>($I`SparqlTimeoutError`)(
  "SparqlTimeoutError",
  {
    query: S.String,
    message: S.String,
    timeoutMs: S.Number,
  },
  $I.annotations("SparqlTimeoutError", {
    description: "SPARQL query execution exceeded timeout",
  })
) {}

export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>($I`SparqlExecutionError`)(
  "SparqlExecutionError",
  {
    query: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("SparqlExecutionError", {
    description: "SPARQL query execution failed",
  })
) {}

export class SparqlUnsupportedFeatureError extends S.TaggedError<SparqlUnsupportedFeatureError>(
  $I`SparqlUnsupportedFeatureError`
)(
  "SparqlUnsupportedFeatureError",
  {
    feature: S.String,
    queryString: S.String,
    message: S.String,
  },
  $I.annotations("SparqlUnsupportedFeatureError", {
    description: "SPARQL query uses unsupported feature",
  })
) {}

export class SparqlError extends S.Union(
  SparqlSyntaxError,
  SparqlTimeoutError,
  SparqlExecutionError,
  SparqlUnsupportedFeatureError
).annotations(
  $I.annotations("SparqlError", {
    description: "Union of all SPARQL error types",
  })
) {}

export declare namespace SparqlError {
  export type Type = typeof SparqlError.Type;
  export type Encoded = typeof SparqlError.Encoded;
}
