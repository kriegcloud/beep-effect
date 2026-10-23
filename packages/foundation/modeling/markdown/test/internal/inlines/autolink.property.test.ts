import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { describeConstructFloor } from "./propertyFloor.ts";

const Sample = S.Struct({
  scheme: S.Literals(["https", "ftp", "custom+v1"]),
  label: S.Array(S.Literals(["a", "b", "9"])),
});
const sources = Arbitrary.schema(Sample).pipe(
  Arbitrary.map(
    (sample) =>
      `<${sample.scheme}://example.org/${A.join(sample.label, "")}> and <ada${A.join(sample.label, "")}@example.org>`
  )
);
describeConstructFloor({ name: "autolink", sources });
