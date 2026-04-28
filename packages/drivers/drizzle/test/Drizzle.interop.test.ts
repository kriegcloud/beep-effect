import { type DrizzleEffectYieldableBase, installDrizzleEffectYieldables } from "@beep/drizzle/interop";
import { describe, expect, it } from "@effect/vitest";
import * as assert from "@effect/vitest/utils";
import { Effect, type Effect as EffectType } from "effect";

class QueryBase {
  execute() {
    return Effect.succeed("ok");
  }
}

class YieldableQueryBase {
  execute() {
    return Effect.succeed("execute");
  }
}

interface YieldableQueryBase extends EffectType.Effect<string> {
  readonly commit: () => EffectType.Effect<string>;
}

class ExistingCommitQueryBase {
  execute() {
    return Effect.succeed("execute");
  }

  commit() {
    return Effect.succeed("commit");
  }
}

interface ExistingCommitQueryBase extends EffectType.Effect<string> {}

describe("Drizzle interop", () => {
  it("installs native Effect yieldability idempotently", () => {
    installDrizzleEffectYieldables(QueryBase);
    const firstCommit = Reflect.get(QueryBase.prototype, "commit");

    installDrizzleEffectYieldables(QueryBase);
    const secondCommit = Reflect.get(QueryBase.prototype, "commit");

    expect(typeof firstCommit).toBe("function");
    expect(secondCommit).toBe(firstCommit);
  });

  it("uses referential installed checks for hostile proxy constructors", () => {
    class NormalBeforeHostileProxy {}
    const hostilePrototype = {
      execute() {
        return Effect.succeed("hostile");
      },
    };
    const hostileBase: DrizzleEffectYieldableBase = new Proxy(
      { prototype: hostilePrototype },
      {
        ownKeys() {
          throw new Error("ownKeys failed");
        },
      }
    );

    installDrizzleEffectYieldables(NormalBeforeHostileProxy);
    expect(() => installDrizzleEffectYieldables(hostileBase)).not.toThrow();

    expect(typeof Reflect.get(hostilePrototype, "commit")).toBe("function");
  });

  it.effect(
    "yields patched queries and executes the fallback commit",
    Effect.fnUntraced(function* () {
      installDrizzleEffectYieldables(YieldableQueryBase);
      const query = new YieldableQueryBase();

      const yielded = yield* query;
      const committed = yield* query.commit();

      assert.strictEqual(yielded, "execute");
      assert.strictEqual(committed, "execute");
    })
  );

  it.effect(
    "preserves existing commit methods",
    Effect.fnUntraced(function* () {
      const commit = ExistingCommitQueryBase.prototype.commit;

      installDrizzleEffectYieldables(ExistingCommitQueryBase);
      const query = new ExistingCommitQueryBase();
      const yielded = yield* query;
      const committed = yield* query.commit();

      assert.strictEqual(Reflect.get(ExistingCommitQueryBase.prototype, "commit"), commit);
      assert.strictEqual(yielded, "execute");
      assert.strictEqual(committed, "commit");
    })
  );
});
