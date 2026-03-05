import { Effect } from "effect";
import * as S from "effect/Schema";

const schema = S.declareConstructor<number, string>()(
  [],
  () => (input, _ast, _options) => S.decodeUnknownEffect(S.Number)(input).pipe(Effect.map((value) => value))
);

console.log("decode", S.decodeUnknownSync(schema)(1));
try {
  console.log("encode", S.encodeSync(schema)(1));
} catch (e) {
  console.log("encode error", String(e));
}
