import * as S from "effect/Schema";

declare function destructiveTransform<Self extends S.Schema<any, any, any>, B>(
  transform: (input: S.Schema.Type<Self>) => B
): (self: Self) => S.Schema<Readonly<B>, S.Schema.Encoded<Self>, S.Schema.Context<Self>>;

const LengthFromString = S.String.pipe(destructiveTransform((value) => value.length));

// should be ok
const _: number = LengthFromString.Type;
