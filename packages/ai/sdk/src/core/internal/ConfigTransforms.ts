import { CommaSeparatedList } from "@beep/schema";
import { Struct, Text } from "@beep/utils";
import { pipe, Redacted } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

/**
 * Normalize an optional redacted value by trimming and dropping empty text.
 *
 * @since 0.0.0
 */
export const normalizeRedactedOption = (value: O.Option<Redacted.Redacted>) =>
  O.flatMap(value, (redacted) => {
    const normalized = Str.trim(Redacted.value(redacted));
    return Str.isNonEmpty(normalized) ? O.some(redacted) : O.none();
  });

/**
 * Parse optional comma-separated text and drop empty lists.
 *
 * @since 0.0.0
 */
export const parseOptionalCommaSeparatedList = (value: O.Option<string>) =>
  O.flatMap(value, (raw) => {
    const schemaDecoded = S.decodeUnknownOption(CommaSeparatedList)(raw);
    return O.match(schemaDecoded, {
      onNone: () => S.decodeUnknownOption(S.NonEmptyArray(S.String))(Text.splitCommaSeparatedTrimmed(raw)),
      onSome: (entries) => S.decodeUnknownOption(S.NonEmptyArray(S.String))(entries),
    });
  });

/**
 * Pick the first available optional value.
 *
 * @since 0.0.0
 */
export const preferFirstOption = <A>(primary: O.Option<A>, fallback: O.Option<A>): O.Option<A> =>
  O.isSome(primary) ? primary : fallback;

/**
 * Build environment passthrough with auth entries.
 *
 * @since 0.0.0
 */
export const buildAuthEnv = (
  processEnv: NodeJS.ProcessEnv,
  apiKey: O.Option<Redacted.Redacted>,
  sessionAccessToken: O.Option<Redacted.Redacted>
): NodeJS.ProcessEnv | undefined => {
  const apiKeyEntries = O.match(apiKey, {
    onNone: () => A.empty<readonly [string, string]>(),
    onSome: (redacted) => A.make(["ANTHROPIC_API_KEY", Redacted.value(redacted)] as const),
  });
  const sessionAccessTokenEntries = O.match(sessionAccessToken, {
    onNone: () => A.empty<readonly [string, string]>(),
    onSome: (redacted) => A.make(["CLAUDE_CODE_SESSION_ACCESS_TOKEN", Redacted.value(redacted)] as const),
  });
  const authEnvEntries = A.appendAll(apiKeyEntries, sessionAccessTokenEntries);

  return pipe(
    authEnvEntries,
    A.match({
      onEmpty: () => undefined,
      onNonEmpty: () => ({
        ...processEnv,
        ...Struct.fromEntries(authEnvEntries),
      }),
    })
  );
};
