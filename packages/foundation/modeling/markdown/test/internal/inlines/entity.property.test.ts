import * as Arbitrary from "effect/Arbitrary";
import * as S from "effect/Schema";
import { describeConstructFloor } from "./propertyFloor.ts";

const Sample = S.Struct({
  named: S.Literals(["&amp;", "&copy;", "&unknown;", "&quot;"]),
  code: S.Int.check(S.isBetween({ minimum: 65, maximum: 122 })),
});
const sources = Arbitrary.schema(Sample).pipe(
  Arbitrary.map((sample) => `before ${sample.named} &#${sample.code}; &#x${sample.code.toString(16)}; after`)
);
describeConstructFloor({ name: "entity", sources });
