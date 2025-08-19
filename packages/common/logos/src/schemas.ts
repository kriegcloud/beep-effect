import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

export const Entity = F.flow(
  <const Tag extends Lowercase<string>, const Label extends string>(
    tag: Tag,
    label: Label,
  ) =>
    F.pipe(
      S.Literal(tag).pipe(
        S.optional,
        S.withDefaults({
          constructor: F.constant(tag),
          decoding: F.constant(tag),
        }),
      ),
      (tagSchema) =>
        S.Struct({
          _tag: tagSchema.pipe(S.fromKey("value")),
          label: S.Literal(label).pipe(
            S.optional,
            S.withDefaults({
              constructor: F.constant(label),
              decoding: F.constant(label),
            }),
          ),
          name: F.pipe(F.constant(Str.capitalize(tag)), (constTag) =>
            S.Literal(constTag()).pipe(
              S.optional,
              S.withDefaults({
                decoding: constTag,
                constructor: constTag,
              }),
            ),
          ),
        }),
    ),
);
