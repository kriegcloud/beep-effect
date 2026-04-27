import { installDrizzleEffectYieldables } from "@beep/drizzle/interop";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

class QueryBase {
  execute() {
    return Effect.succeed("ok");
  }
}

describe("Drizzle interop", () => {
  it("installs native Effect yieldability idempotently", () => {
    installDrizzleEffectYieldables(QueryBase);
    const firstCommit = Reflect.get(QueryBase.prototype, "commit");

    installDrizzleEffectYieldables(QueryBase);
    const secondCommit = Reflect.get(QueryBase.prototype, "commit");

    expect(typeof firstCommit).toBe("function");
    expect(secondCommit).toBe(firstCommit);
  });
});
