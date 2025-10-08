import * as Effect from "effect/Effect";
import { Csp } from "./config";

// import * as Config from "effect/Config";
// import * as S from "effect/Schema";
const program = Effect.gen(function* () {
  const csp = yield* Csp.Config("SECURITY_CSP");

  yield* Effect.log(csp);
});

Effect.runPromise(program);
