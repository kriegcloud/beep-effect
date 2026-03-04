import { CommaSeparatedList } from "@beep/schema";
import { Text } from "@beep/utils";
import { Effect, Redacted, String as Str } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";

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
      onNone: () => {
        const entries = Text.splitCommaSeparatedTrimmed(raw);
        return entries.length > 0 ? O.some(entries) : O.none();
      },
      onSome: (entries) => (entries.length > 0 ? O.some(entries) : O.none()),
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
  const authEnvEntries: Array<readonly [string, string]> = [];
  if (O.isSome(apiKey)) {
    authEnvEntries.push(["ANTHROPIC_API_KEY", Redacted.value(apiKey.value)]);
  }
  if (O.isSome(sessionAccessToken)) {
    authEnvEntries.push(["CLAUDE_CODE_SESSION_ACCESS_TOKEN", Redacted.value(sessionAccessToken.value)]);
  }
  return authEnvEntries.length > 0
    ? {
        ...processEnv,
        ...R.fromEntries(authEnvEntries),
      }
    : undefined;
};

/**
 * Read process environment at runtime boundary.
 *
 * @since 0.0.0
 */
export const readProcessEnv = Effect.sync(() => process.env);

/**
 * Read current working directory at runtime boundary.
 *
 * @since 0.0.0
 */
export const readProcessCwd = Effect.sync(() => process.cwd());
