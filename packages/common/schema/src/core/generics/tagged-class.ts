import type { StringTypes } from "@beep/types";
import { pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

type TaggedClass = S.Schema.Any & {
  readonly _tag: StringTypes.NonEmptyString;
  readonly fields: S.Struct.Fields & { _tag: S.tag<any> };
};

type Tag<Tagged extends TaggedClass> = Tagged["_tag"];
type Fields<Tagged extends TaggedClass> = Tagged["fields"];

type DefaultTaggedClassType<Tagged extends TaggedClass> = S.Schema.Type<Tagged>;
type DefaultTaggedClassEncoded<Tagged extends TaggedClass> = S.Struct.Encoded<Omit<Fields<Tagged>, "_tag">> &
  S.Struct.Encoded<{
    _tag: S.PropertySignature<":", Tag<Tagged>, never, "?:", Tag<Tagged>, false, never>;
  }> extends infer B
  ? B
  : never;
type DefaultTaggedClassContext<Tagged extends TaggedClass> = S.Schema.Context<Tagged>;
type DefaultTaggedClass<Tagged extends TaggedClass> = S.Schema<
  DefaultTaggedClassType<Tagged>,
  DefaultTaggedClassEncoded<Tagged>,
  DefaultTaggedClassContext<Tagged>
>;

export const DefaultTaggedClass = <Tagged extends TaggedClass>(taggedClass: Tagged): DefaultTaggedClass<Tagged> =>
  pipe(
    pipe(
      S.encodedSchema(S.Struct(taggedClass.fields).omit("_tag")),
      S.extend(
        S.Struct({
          _tag: S.optionalToRequired(S.Literal(taggedClass._tag), S.Literal(taggedClass._tag), {
            decode: O.getOrElse(() => taggedClass._tag),
            encode: (value) => O.some(value),
          }),
        })
      )
    ) as unknown as S.Schema<S.Struct.Encoded<Fields<Tagged>>, DefaultTaggedClassEncoded<Tagged>>,
    S.compose(
      taggedClass as S.Schema<
        DefaultTaggedClassType<Tagged>,
        S.Struct.Encoded<Fields<Tagged>>,
        DefaultTaggedClassContext<Tagged>
      >
    )
  ) as DefaultTaggedClass<Tagged>;
