import { Effect, pipe, SchemaIssue, SchemaTransformation, String as Str } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { normalizePath, PosixPath } from "../../eslint/Shared.ts";

class RulePathPair extends S.Class<RulePathPair>("RulePathPair")({
  cwd: PosixPath,
  absoluteFilePath: PosixPath,
}) {}

export class RuleFilePathContext extends S.Class<RuleFilePathContext>("RuleFilePathContext")({
  cwd: PosixPath,
  absoluteFilePath: PosixPath,
  relativeFilePath: PosixPath,
}) {}

const encodeUnsupported = (value: unknown): Effect.Effect<RulePathPair, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values is not supported by RulePathPairToRelativePath.",
    })
  );

const RulePathPairToRelativePath = RulePathPair.pipe(
  S.decodeTo(
    PosixPath,
    SchemaTransformation.transformOrFail({
      decode: ({ cwd, absoluteFilePath }) =>
        Effect.succeed(
          pipe(
            O.liftPredicate(Str.startsWith(`${cwd}/`))(absoluteFilePath),
            O.map(Str.slice(cwd.length + 1)),
            O.getOrElse(() => absoluteFilePath)
          )
        ),
      encode: encodeUnsupported,
    })
  )
);

const decodeRelativePathPair = S.decodeUnknownOption(RulePathPairToRelativePath);

/**
 * Resolve normalized file path context for rule execution.
 *
 * @since 0.0.0
 * @category Utility
 */
export const resolveRuleFilePathContext = (filename: string, cwd = process.cwd()): RuleFilePathContext => {
  const normalizedCwd = normalizePath(cwd);
  const normalizedAbsoluteFilePath = normalizePath(filename);
  const relativeFilePath = pipe(
    decodeRelativePathPair(
      new RulePathPair({
        cwd: normalizedCwd,
        absoluteFilePath: normalizedAbsoluteFilePath,
      })
    ),
    O.getOrElse(() => normalizedAbsoluteFilePath)
  );

  return new RuleFilePathContext({
    cwd: normalizedCwd,
    absoluteFilePath: normalizedAbsoluteFilePath,
    relativeFilePath,
  });
};

/**
 * Resolve a normalized repo-relative file path for rule allowlist checks.
 *
 * @since 0.0.0
 * @category Utility
 */
export const resolveRelativeRuleFilePath = (filename: string, cwd = process.cwd()): string =>
  resolveRuleFilePathContext(filename, cwd).relativeFilePath;
