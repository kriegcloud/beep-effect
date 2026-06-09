/**
 * Schema issue diagnostic formatting for laws tooling.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A } from "@beep/utils";
import { pipe, SchemaIssue } from "effect";
import * as S from "effect/Schema";

const standardSchemaFormatter = SchemaIssue.makeFormatterStandardSchemaV1();
const redactedSchemaFormatter = SchemaIssue.makeFormatterStandardSchemaV1({
  checkHook: () => "Invalid data <redacted>",
  leafHook: () => "Invalid data <redacted>",
});

type StandardPathSegment = PropertyKey | { readonly key: PropertyKey };

type StandardIssueDiagnostic = {
  readonly message: string;
  readonly path?: ReadonlyArray<StandardPathSegment> | undefined;
};

const schemaIssueFrom = (errorOrIssue: S.SchemaError | SchemaIssue.Issue): SchemaIssue.Issue =>
  errorOrIssue instanceof S.SchemaError ? errorOrIssue.issue : errorOrIssue;

const formatPathSegment = (segment: StandardPathSegment): string =>
  typeof segment === "object" && segment !== null && "key" in segment ? String(segment.key) : String(segment);

const formatPathLabel = (path: ReadonlyArray<StandardPathSegment> | undefined): string =>
  path === undefined || A.isReadonlyArrayEmpty(path) ? "<root>" : pipe(path, A.map(formatPathSegment), A.join("."));

const formatStandardIssue = (diagnostic: StandardIssueDiagnostic): string =>
  `${formatPathLabel(diagnostic.path)}: ${diagnostic.message}`;

/**
 * Format a schema issue or schema error as path-prefixed Standard Schema V1 diagnostics.
 *
 * @example
 * ```ts
 * import { formatSchemaDiagnostics } from "@beep/repo-cli/commands/Laws/SchemaDiagnostics"
 *
 * console.log(formatSchemaDiagnostics)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const formatSchemaDiagnostics = (errorOrIssue: S.SchemaError | SchemaIssue.Issue): ReadonlyArray<string> =>
  pipe(standardSchemaFormatter(schemaIssueFrom(errorOrIssue)).issues, A.map(formatStandardIssue));

/**
 * Format a schema issue or schema error after redacting actual values.
 *
 * @example
 * ```ts
 * import { formatRedactedSchemaDiagnostics } from "@beep/repo-cli/commands/Laws/SchemaDiagnostics"
 *
 * console.log(formatRedactedSchemaDiagnostics)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const formatRedactedSchemaDiagnostics = (
  errorOrIssue: S.SchemaError | SchemaIssue.Issue
): ReadonlyArray<string> =>
  pipe(redactedSchemaFormatter(schemaIssueFrom(errorOrIssue)).issues, A.map(formatStandardIssue));
