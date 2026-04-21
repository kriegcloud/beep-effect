/**
 * The repositories i18n configuration.
 *
 * @since 0.0.0
 * @module
 */
import { O } from "@beep/utils";
import { Exit, Match, pipe, SchemaIssue } from "effect";
import * as S from "effect/Schema";
import i18next from "i18next";

void i18next.init({
  lng: "en",
  resources: {
    en: {
      translation: {
        "string.mismatch": "Please enter a valid string",
        "string.minLength": "Please enter at least {{minLength}} character(s)",
        "struct.missingKey": "This field is required",
        "struct.unexpectedKey": "Unexpected field",
        "struct.mismatch": "Please enter a valid object",
        "default.mismatch": "Invalid type",
        "default.invalidValue": "Invalid value",
        "default.forbidden": "Forbidden operation",
        "default.oneOf": "Too many successful values",
        "default.check": "The value does not match the check",
      },
    },
  },
});

/**
 * Translation function configured for repository messages.
 *
 * @example
 * ```typescript
 * import { t } from "@beep/messages"
 *
 * const msg = t("struct.missingKey")
 * console.log(msg) // "This field is required"
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const t = i18next.t;

/**
 * Configuration for schema issue formatting hooks.
 *
 * @example
 * ```typescript
 * import type { GetLogIssuesOptions } from "@beep/messages"
 *
 * const opts: GetLogIssuesOptions = {
 * 
 * 
 * }
 * void opts
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type GetLogIssuesOptions = Readonly<{
  readonly checkHook?: undefined | SchemaIssue.CheckHook;
  readonly leafHook?: undefined | SchemaIssue.LeafHook;
}>;

/**
 * A helper to retrieve issues from schema parse issues
 *
 * @example
 * ```ts
 * import { getLogIssues, t } from "@beep/messages";
 * import * as S from "effect/Schema";
 *
 * const Person = S.Struct({
 * 
 * });
 *
 * // Configure hooks to customize how issues are rendered
 * const logIssues = getLogIssues({
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * })
 *
 * // Invalid object (not even a struct)
 * logIssues(Person, null)
 * // Failure(Cause([Fail([{"path":[],"message":"Please enter a valid object"}])]))
 *
 * // Missing "name" key
 * logIssues(Person, {})
 * // Failure(Cause([Fail([{"path":["name"],"message":"This field is required"}])]))
 *
 * // "name" has the wrong type
 * logIssues(Person, { name: 1 })
 * // Failure(Cause([Fail([{"path":["name"],"message":"Please enter a valid string"}])]))
 *
 * // "name" is an empty string
 * logIssues(Person, { name: "" })
 * // Failure(Cause([Fail([{"path":["name"],"message":"Please enter at least 1 character(s)"}])]))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 * @param options - Optional formatter hooks for schema and leaf issue rendering.
 */
export function getLogIssues(options?: GetLogIssuesOptions) {
  return <S extends S.Codec<unknown, unknown>>(schema: S, input: unknown) => {
    console.log(
      String(
        S.decodeUnknownExit(schema)(input, { errors: "all" }).pipe(
          Exit.mapError((err) => SchemaIssue.makeFormatterStandardSchemaV1(options)(err.issue).issues)
        )
      )
    );
  };
}

const matchInvalidIssue = Match.type<SchemaIssue.InvalidType["ast"]>().pipe(
  Match.tags({
    String: () => t("string.mismatch"), // Wrong type for a string,
    Objects: () => t("struct.mismatch"), // Value is not an object
  }),
  Match.orElse(() => t("default.mismatch"))
);

/**
 * Default formatter hook for leaf-level schema issues.
 *
 * Maps each schema issue variant to an i18n translated message string.
 *
 * @example
 * ```typescript
 * import { leafHook } from "@beep/messages"
 *
 * console.log(typeof leafHook) // "function"
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const leafHook = Match.type<SchemaIssue.Leaf>().pipe(
  Match.tagsExhaustive({
    InvalidType: (issue) => matchInvalidIssue(issue.ast),
    InvalidValue: () => t("default.invalidValue"),
    MissingKey: () => t("struct.missingKey"),
    UnexpectedKey: () => t("struct.unexpectedKey"),
    Forbidden: () => t("default.forbidden"),
    OneOf: () => t("default.oneOf"),
  })
);
const thunkDefaultCheck = () => t("default.check");
const matchMetaFilter = Match.type<S.Annotations.Filter["meta"]>().pipe(
  Match.tag("isMinLength", ({ minLength }) => t("string.minLength", { minLength })),
  Match.orElse(thunkDefaultCheck)
);

/**
 * Default issue logger using the repository i18n formatter hooks.
 *
 * @example
 * ```typescript
 * import { logIssues } from "@beep/messages"
 * import * as S from "effect/Schema"
 *
 * const Person = S.Struct({ name: S.NonEmptyString })
 *
 * logIssues(Person, { name: "" })
 * // Logs formatted issues to console
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const logIssues = getLogIssues({
  // Format leaf-level issues (missing key, wrong type, etc.)
  leafHook,
  // Format custom check errors (like isMinLength or user-defined validations)
  checkHook: ({ filter: { annotations } }) =>
    pipe(
      annotations,
      O.fromNullishOr,
      O.flatMap(O.propFromNullishOr("meta")),
      O.match({
        onNone: thunkDefaultCheck,
        onSome: matchMetaFilter,
      })
    ),
});
// bench
