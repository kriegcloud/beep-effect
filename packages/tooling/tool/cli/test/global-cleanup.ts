import { Effect } from "effect";

export default function globalCleanup() {
  return Effect.runPromise(Effect.gen(function* () {}));
}
