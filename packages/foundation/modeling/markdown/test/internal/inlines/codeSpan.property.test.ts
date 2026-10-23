import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { describeConstructFloor } from "./propertyFloor.ts";

const Sample = S.Struct({
  ticks: S.Literals(["`", "``", "```"]),
  content: S.Array(S.Literals(["a", "b", " ", "\n", "é"])),
});
const sources = Arbitrary.schema(Sample).pipe(
  Arbitrary.map((sample) => `before ${sample.ticks} x${A.join(sample.content, "x")}y ${sample.ticks} after`)
);
describeConstructFloor({ name: "codeSpan", sources });
