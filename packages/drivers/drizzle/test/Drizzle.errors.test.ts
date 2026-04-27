import { Drizzle, type DrizzleClient, DrizzleError } from "@beep/drizzle";
import { EffectDrizzleQueryError } from "@beep/drizzle/interop";
import { describe, expect, it } from "@effect/vitest";
import { Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const makeClient = (execute: DrizzleClient["execute"]): DrizzleClient => {
  let client: DrizzleClient;
  client = {
    execute,
    withTransaction: (use) => use(client),
  };
  return client;
};

describe("DrizzleError", () => {
  it("constructs the single public tagged driver error", () => {
    const error = new DrizzleError({
      operation: "execute",
      cause: O.none(),
    });

    expect(error).toBeInstanceOf(DrizzleError);
    expect(error._tag).toBe("DrizzleError");
    expect(error.operation).toBe("execute");
    expect(O.isNone(error.cause)).toBe(true);
    expect(O.isNone(error.query)).toBe(true);
    expect(O.isNone(error.params)).toBe(true);
  });

  it("normalizes unknown causes into the optional cause field", () => {
    const cause = new Error("driver failed");
    const error = DrizzleError.fromUnknown("withTransaction", cause);

    expect(error.operation).toBe("withTransaction");
    expect(O.isSome(error.cause)).toBe(true);
    expect(O.getOrThrow(error.cause)).toBe(cause);
  });

  it("captures explicit query context", () => {
    const error = DrizzleError.fromUnknown("execute", new Error("driver failed"), {
      query: "select * from users where id = $1",
      params: [1],
    });

    expect(O.getOrThrow(error.query)).toBe("select * from users where id = $1");
    expect(O.getOrThrow(error.params)).toEqual([1]);
  });

  it("captures native Drizzle Effect query context", () => {
    const cause = new EffectDrizzleQueryError({
      query: "select 1",
      params: [],
      cause: new Error("driver failed"),
    });
    const error = DrizzleError.fromUnknown("execute", cause);

    expect(O.getOrThrow(error.query)).toBe("select 1");
    expect(O.getOrThrow(error.params)).toEqual([]);
  });

  it("decodes an omitted cause as none", () => {
    const error = S.decodeUnknownSync(DrizzleError)({
      _tag: "DrizzleError",
      operation: "execute",
    });

    expect(error.operation).toBe("execute");
    expect(O.isNone(error.cause)).toBe(true);
    expect(O.isNone(error.query)).toBe(true);
    expect(O.isNone(error.params)).toBe(true);
  });
});

describe("Drizzle", () => {
  it.effect("exposes adapter execute failures as DrizzleError", () =>
    Effect.gen(function* () {
      const cause = new Error("execute failed");
      const client = makeClient(() => Effect.fail(DrizzleError.fromUnknown("execute", cause)));
      const program = Effect.gen(function* () {
        const drizzle = yield* Drizzle;
        return yield* drizzle.execute("select 1", []);
      });
      const error = yield* pipe(program, Effect.provide(Drizzle.makeLayer(client)), Effect.flip);

      expect(error).toBeInstanceOf(DrizzleError);
      expect(error.operation).toBe("execute");
      expect(O.getOrThrow(error.cause)).toBe(cause);
    })
  );

  it.effect("uses explicit Effect-native transaction callbacks", () =>
    Effect.gen(function* () {
      const client = makeClient((statement) => Effect.succeed([statement]));
      const program = Effect.gen(function* () {
        const drizzle = yield* Drizzle;
        return yield* drizzle.withTransaction((transaction) => transaction.execute("select 1", []));
      });
      const rows = yield* pipe(program, Effect.provide(Drizzle.makeLayer(client)));

      expect(rows).toEqual(["select 1"]);
    })
  );
});
