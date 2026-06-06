/**
 * Schema validation error routing for form fields.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FormId } from "@beep/identity/packages";
import { HashMap, HashSet, Match, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { schemaPathToFieldPath } from "./Path.ts";

const $I = $FormId.create("core/Validation");

/**
 * Validation error source literal schema.
 *
 * @example
 * ```ts
 * import { ErrorSource } from "@beep/form/core/Validation"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(ErrorSource)("field")) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ErrorSource = S.Literals(["field", "refinement"]).pipe(
  $I.annoteSchema("ErrorSource", {
    description: "Origin marker for validation errors routed from schema fields or form-level refinements.",
  })
);

/**
 * Runtime type extracted from {@link ErrorSource}.
 *
 * @example
 * ```ts
 * import type { ErrorSource } from "@beep/form/core/Validation"
 *
 * const source: ErrorSource = "refinement"
 * console.log(source) // "refinement"
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ErrorSource = typeof ErrorSource.Type;

/**
 * Renderable validation error with source metadata.
 *
 * @example
 * ```ts
 * import { ErrorEntry } from "@beep/form/core/Validation"
 *
 * const entry = ErrorEntry.make({ message: "Required", source: "field" })
 * console.log(entry.message) // "Required"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ErrorEntry extends S.Class<ErrorEntry>($I`ErrorEntry`)(
  {
    message: S.String,
    source: ErrorSource,
  },
  $I.annote("ErrorEntry", {
    description: "Renderable validation error with its routed form source.",
  })
) {}

interface IssueSourceEntry {
  readonly issue: SchemaIssue.Issue;
  readonly path: ReadonlyArray<PropertyKey>;
  readonly source: ErrorSource;
}

const collectIssueSources = (error: S.SchemaError): ReadonlyArray<IssueSourceEntry> => {
  let entries = A.empty<IssueSourceEntry>();

  const walk = (issue: SchemaIssue.Issue, path: ReadonlyArray<PropertyKey>, source: ErrorSource): void => {
    Match.value(issue).pipe(
      Match.tag("Filter", (filterIssue) => {
        walk(filterIssue.issue, path, A.length(path) === 0 ? "refinement" : source);
      }),
      Match.tag("Pointer", (pointerIssue) => {
        walk(pointerIssue.issue, A.appendAll(path, pointerIssue.path), source);
      }),
      Match.tag("Composite", (compositeIssue) => {
        for (const sub of compositeIssue.issues) {
          walk(sub, path, source);
        }
      }),
      Match.tag("Encoding", (encodingIssue) => {
        walk(encodingIssue.issue, path, A.length(path) === 0 ? "refinement" : source);
      }),
      Match.tag("AnyOf", (anyOfIssue) => {
        if (A.length(anyOfIssue.issues) === 0) {
          entries = A.append(entries, { path, source, issue: anyOfIssue });
        } else {
          for (const sub of anyOfIssue.issues) {
            walk(sub, path, source);
          }
        }
      }),
      Match.orElse((otherIssue) => {
        entries = A.append(entries, { path, source, issue: otherIssue });
      })
    );
  };

  walk(error.issue, [], "field");
  return entries;
};

const getIssueMessage = (issue: SchemaIssue.Issue): string | undefined => {
  const formatted = SchemaIssue.makeFormatterStandardSchemaV1()(issue).issues;
  return A.head(formatted).pipe(
    O.map((entry) => entry.message),
    O.getOrUndefined
  );
};

/**
 * Extracts the first user-facing message from a schema error.
 *
 * @example
 * ```ts
 * import { extractFirstError } from "@beep/form/core/Validation"
 * import { Effect } from "effect"
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 *
 * const error = Effect.runSync(Effect.flip(S.decodeUnknownEffect(S.Finite)("nope")))
 * const message = extractFirstError(error)
 * console.log(O.isSome(message)) // true
 * ```
 *
 * @category destructors
 * @since 0.0.0
 */
export const extractFirstError = (error: S.SchemaError): O.Option<string> => {
  const issues = SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues;
  return A.head(issues).pipe(O.map((issue) => issue.message));
};

/**
 * Routes schema error messages to form field paths.
 *
 * @example
 * ```ts
 * import { routeErrors } from "@beep/form/core/Validation"
 * import { Effect, HashMap } from "effect"
 * import * as S from "effect/Schema"
 *
 * const error = Effect.runSync(Effect.flip(S.decodeUnknownEffect(S.Struct({ age: S.Finite }))({ age: "x" })))
 * const errors = routeErrors(error)
 * console.log(HashMap.has(errors, "age")) // true
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const routeErrors = (error: S.SchemaError): HashMap.HashMap<string, string> => {
  let result = HashMap.empty<string, string>();
  const issues = SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues;

  for (const issue of issues) {
    const fieldPath = schemaPathToFieldPath(issue.path);
    if (fieldPath !== "" && !HashMap.has(result, fieldPath)) {
      result = HashMap.set(result, fieldPath, issue.message);
    }
  }

  return result;
};

/**
 * Routes schema error messages to form field paths with source metadata.
 *
 * @example
 * ```ts
 * import { routeErrorsWithSource } from "@beep/form/core/Validation"
 * import { Effect, HashMap } from "effect"
 * import * as S from "effect/Schema"
 *
 * const error = Effect.runSync(Effect.flip(S.decodeUnknownEffect(S.Struct({ name: S.String }))({ name: 1 })))
 * const errors = routeErrorsWithSource(error)
 * console.log(HashMap.has(errors, "name")) // true
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const routeErrorsWithSource = (error: S.SchemaError): HashMap.HashMap<string, ErrorEntry> => {
  let result = HashMap.empty<string, ErrorEntry>();
  const formattedIssues = SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues;
  const issueSources = collectIssueSources(error);
  let messageSources = HashMap.empty<string, ErrorSource>();
  let refinementPaths = HashSet.empty<string>();

  for (const entry of issueSources) {
    const fieldPath = schemaPathToFieldPath(entry.path);
    const message = getIssueMessage(entry.issue);
    if (message !== undefined) {
      const messageKey = `${fieldPath}::${message}`;
      const existing = HashMap.get(messageSources, messageKey);
      if (O.isNone(existing) || (existing.value === "field" && entry.source === "refinement")) {
        messageSources = HashMap.set(messageSources, messageKey, entry.source);
      }
    }
    if (entry.source === "refinement") {
      refinementPaths = HashSet.add(refinementPaths, fieldPath);
    }
  }

  for (const issue of formattedIssues) {
    const fieldPath = schemaPathToFieldPath(issue.path);
    if (HashMap.has(result, fieldPath)) continue;
    const preferredSource: ErrorSource = HashSet.has(refinementPaths, fieldPath) ? "refinement" : "field";
    const messageKey = `${fieldPath}::${issue.message}`;
    const issueSource = HashMap.get(messageSources, messageKey).pipe(O.getOrElse((): ErrorSource => "field"));
    if (preferredSource === "refinement" && issueSource !== "refinement") {
      continue;
    }
    result = HashMap.set(result, fieldPath, ErrorEntry.make({ message: issue.message, source: issueSource }));
  }

  if (HashMap.size(result) < A.length(formattedIssues)) {
    for (const issue of formattedIssues) {
      const fieldPath = schemaPathToFieldPath(issue.path);
      if (HashMap.has(result, fieldPath)) continue;
      const messageKey = `${fieldPath}::${issue.message}`;
      const issueSource = HashMap.get(messageSources, messageKey).pipe(O.getOrElse((): ErrorSource => "field"));
      result = HashMap.set(result, fieldPath, ErrorEntry.make({ message: issue.message, source: issueSource }));
    }
  }

  return result;
};
