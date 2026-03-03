/**
 * The repositories i18n configuration.
 *
 * @since 0.0.0
 * @module @beep/messages/i18n
 */
import { Exit, Match, pipe, SchemaIssue } from "effect";
import * as O from "effect/Option";
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
 * @since 0.0.0
 * @category Utility
 */
export const t = i18next.t;

/**
 * Configuration for schema issue formatting hooks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface GetLogIssuesOptions {
  readonly leafHook?: undefined | SchemaIssue.LeafHook;
  readonly checkHook?: undefined | SchemaIssue.CheckHook;
}

/**
 * A helper to retrieve issues from schema parse issues
 *
 * @example
 * import { getLogIssues } from "@beep/messages";
 * import * as S from "effect/Schema";
 *
 * const Person = S.Struct({
 *   name: S.String.check(S.isNonEmpty())
 * });
 *
 * // Configure hooks to customize how issues are rendered
 * const logIssues = getLogIssues({
 *   // Format leaf-level issues (missing key, wrong type, etc.)
 *   leafHook: (issue) => {
 *     switch (issue._tag) {
 *       case "InvalidType": {
 *         if (issue.ast._tag === "String") {
 *           return t("string.mismatch") // Wrong type for a string
 *         } else if (issue.ast._tag === "Objects") {
 *           return t("struct.mismatch") // Value is not an object
 *         }
 *         return t("default.mismatch") // Fallback for other types
 *       }
 *       case "InvalidValue": {
 *         return t("default.invalidValue")
 *       }
 *       case "MissingKey":
 *         return t("struct.missingKey")
 *       case "UnexpectedKey":
 *         return t("struct.unexpectedKey")
 *       case "Forbidden":
 *         return t("default.forbidden")
 *       case "OneOf":
 *         return t("default.oneOf")
 *     }
 *   },
 *   // Format custom check errors (like isMinLength or user-defined validations)
 *   checkHook: (issue) => {
 *     const meta = issue.filter.annotations?.meta
 *     if (meta) {
 *       switch (meta._tag) {
 *         case "isMinLength": {
 *           return t("string.minLength", { minLength: meta.minLength })
 *         }
 *       }
 *     }
 *     return t("default.check")
 *   }
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
 *
 *
 * @category Utility
 * @since 0.0.0
 * @param options
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
 * @since 0.0.0
 * @category Utility
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
 * @since 0.0.0
 * @category Utility
 */
export const logIssues = getLogIssues({
  // Format leaf-level issues (missing key, wrong type, etc.)
  leafHook,
  // Format custom check errors (like isMinLength or user-defined validations)
  checkHook: ({ filter: { annotations } }) =>
    pipe(
      annotations,
      O.fromNullishOr,
      O.flatMap(({ meta }) => O.fromNullishOr(meta)),
      O.match({
        onNone: thunkDefaultCheck,
        onSome: matchMetaFilter,
      })
    ),
});
// bench
