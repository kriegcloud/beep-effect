// cspell:ignore codegraph
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("codegraph/graphiti/errors");

/**
 * Graphiti MCP protocol error.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class GraphitiProtocolError extends S.TaggedErrorClass<GraphitiProtocolError>($I`GraphitiProtocolError`)(
  "GraphitiProtocolError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("GraphitiProtocolError", {
    description: "Graphiti MCP request or response violated expected protocol constraints.",
  })
) {}

/**
 * Graphiti preflight failure.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class GraphitiPreflightError extends S.TaggedErrorClass<GraphitiPreflightError>($I`GraphitiPreflightError`)(
  "GraphitiPreflightError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("GraphitiPreflightError", {
    description: "Graphiti proxy preflight checks failed before MCP interaction.",
  })
) {}

/**
 * Graphiti tool invocation error.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class GraphitiToolCallError extends S.TaggedErrorClass<GraphitiToolCallError>($I`GraphitiToolCallError`)(
  "GraphitiToolCallError",
  {
    message: S.String,
    status: S.optional(S.Number),
    bodySnippet: S.optional(S.String),
    cause: S.optional(S.Defect),
  },
  $I.annote("GraphitiToolCallError", {
    description: "Graphiti tools/call request failed or returned an error payload.",
  })
) {}
