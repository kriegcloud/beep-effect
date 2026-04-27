import { Drizzle, type DrizzleClient, DrizzleError, type DrizzleRows, type DrizzleShape } from "@beep/drizzle";
import { installDrizzleEffectYieldables, type QueryEffectHKTBase } from "@beep/drizzle/interop";
import type { Effect, Layer } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "tstyche";

declare const client: DrizzleClient;
declare const service: DrizzleShape;

describe("@beep/drizzle", () => {
  it("exports the single public DrizzleError shape", () => {
    expect(new DrizzleError({ operation: "execute", cause: O.none() })).type.toBe<DrizzleError>();
    expect(DrizzleError.fromUnknown("execute")).type.toBe<DrizzleError>();
    expect(DrizzleError.fromUnknown("execute", new Error("boom"))).type.toBe<DrizzleError>();
    expect<DrizzleError["_tag"]>().type.toBe<"DrizzleError">();
    expect<DrizzleError["operation"]>().type.toBe<string>();
    expect<DrizzleError["cause"]>().type.toBe<O.Option<unknown>>();
    expect<DrizzleError["query"]>().type.toBe<O.Option<string>>();
    expect<DrizzleError["params"]>().type.toBe<O.Option<Array<unknown>>>();

    // @ts-expect-error!
    new DrizzleError({ cause: O.none() });

    // @ts-expect-error!
    new DrizzleError({ operation: "execute", cause: new Error("boom") });
  });

  it("exports the product-neutral service and adapter types", () => {
    expect(Drizzle.makeLayer(client)).type.toBe<Layer.Layer<Drizzle>>();
    expect(service.execute("select 1", [])).type.toBe<Effect.Effect<DrizzleRows, DrizzleError>>();
    expect(service.withTransaction((transaction) => transaction.execute("select 1", []))).type.toBe<
      Effect.Effect<DrizzleRows, DrizzleError>
    >();
  });

  it("exports native Drizzle interop types", () => {
    class QueryBase {
      prototype!: object;
    }

    expect(installDrizzleEffectYieldables).type.toBe<(baseClass: { readonly prototype: object }) => void>();
    expect<QueryEffectHKTBase["$brand"]>().type.toBe<"QueryEffectHKT">();
    installDrizzleEffectYieldables(QueryBase);
  });
});
