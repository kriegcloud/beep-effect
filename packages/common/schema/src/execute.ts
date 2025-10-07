import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const myFnKit = new BS.Fn({
  input: S.String,
  output: S.String,
});

const myFnSchema = myFnKit.Schema;
const MyActualFn = (input: string) => input;

const implementation = myFnKit.implement(MyActualFn);

console.log(S.decodeUnknownOption(myFnSchema)(MyActualFn));
console.log(implementation("beep"));
