import { addEqualityTesters } from "@effect/vitest";
import { P } from "@beep/utils";

addEqualityTesters();

type BunTestShim = {
  readonly env: NodeJS.ProcessEnv;
};

const isBunTestShim = (value: unknown): value is BunTestShim =>
  P.isObjectKeyword(value) && P.isNotNull(value) && P.hasProperty(value, "env");

if (!isBunTestShim(Reflect.get(globalThis, "Bun"))) {
  Reflect.set(globalThis, "Bun", {
    env: process.env,
  } satisfies BunTestShim);
}
