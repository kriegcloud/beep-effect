/** Synthetic child switches; these are never managed production environment keys. */
import * as A from "effect/Array";
import { constant, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const fixtureOption = (prefix: string, fallback: string): string =>
  pipe(
    process.argv,
    A.findLast(Str.startsWith(prefix)),
    O.map(Str.slice(prefix.length)),
    O.getOrElse(constant(fallback))
  );

export const fixtureMode = fixtureOption("--beep-fixture-mode=", "echo");
export const fixtureStallAt = fixtureOption("--beep-fixture-stall-at=", "none");
