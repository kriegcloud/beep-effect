import * as S from "effect/Schema";
import { URLString } from "./custom";

const decoded = S.decodeSync(URLString)("https://google.com");

console.log(decoded);
