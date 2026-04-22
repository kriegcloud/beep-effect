/**
 * Repository CLI Command for working with, indexing and publishing
 * documentation for repo coding agents
 *
 * @module @beep/repo-cli/commands/AIDocs
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity";
import { CauseTaggedError, LiteralKit, NonEmptyTrimmedStr, SchemaUtils } from "@beep/schema";
import { cast } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/AIDocs/AIDocs");

/**
 * AIDocsError - A Tagged Error Class for errors occuring in the AIDocs command
 * context
 *
 * @category Exceptions
 * @since 0.0.0
 */
export class AIDocsError extends CauseTaggedError<AIDocsError>($I`AIDocsError`)(
  "AIDocsError",
  {},
  $I.annote("AIDocsError", {
    description: "AIDocsError - A Tagged Error Class for errors occuring in the AIDocs command\ncontext",
  })
) {}

/**
 * AIDocKind - The kind of AIDoc
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AIDocKind = LiteralKit(["LLMS_TXT", "PLAIN_WEBSITE", "GITHUB_RAW"]).pipe(
  SchemaUtils.withStatics(() => {
    type TaggedStruct<T extends AIDocKind, TFields extends S.Struct.Fields> = S.TaggedStruct<
      T,
      TFields & {
        readonly tags: S.$Array<S.decodeTo<S.String, S.Trim, never, never>>;
        readonly docFor: S.brand<S.Trim, "NonEmptyTrimmedStr">;
      }
    >;
    const makeTaggedStruct: {
      <T extends AIDocKind, TFields extends S.Struct.Fields>(
        tag: S.Literal<T>,
        fields: TFields
      ): TaggedStruct<T, TFields>;
      <TFields extends S.Struct.Fields>(
        fields: TFields
      ): <T extends AIDocKind>(tag: S.Literal<T>) => TaggedStruct<T, TFields>;
    } = dual(2, <T extends AIDocKind, TFields extends S.Struct.Fields>(tag: S.Literal<T>, fields: TFields) =>
      S.TaggedStruct(tag.literal, {
        ...fields,
        url: S.URLFromString.annotateKey({
          description: "url - The URL of the AIDoc",
        }),
        tags: S.Array(
          NonEmptyTrimmedStr
        ).annotateKey({
          description: "tags - The tags associated with the AIDoc",
          examples: [
            cast(["Effect", "Schema", "Reference"])
          ],
        }),
        docFor: NonEmptyTrimmedStr.annotateKey({
          description: "docFor - What this AIDoc is for",
          examples: cast(["drizzle-orm", "effect"]),
        }),
        // createdAt: S.DateTimeUtcFrom
      })
    );

    return {
      makeTaggedStruct,
    };
  }),
  $I.annoteSchema("AIDocKind", {
    description: "AIDocKind - The kind of AIDoc \n one of: LLMS_TXT, PLAIN_WEBSITE, GITHUB_RAW",
  })
);

export type AIDocKind = typeof AIDocKind.Type;
