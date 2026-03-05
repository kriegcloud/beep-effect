import { SchemaGetter } from "effect";
import * as S from "effect/Schema";

const schema = S.String.pipe(
  S.decodeTo(S.Number, {
    decode: SchemaGetter.transform((input: string) => {
      console.log("decode getter called with", input);
      return Number(input);
    }),
    encode: SchemaGetter.transform((input: number) => {
      console.log("encode getter called with", input);
      return String(input);
    }),
  })
);

console.log("--- decodeSync");
console.log(S.decodeSync(schema)("123"));
console.log("--- encodeSync");
console.log(S.encodeSync(schema)(123));
