import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { asyncNoOp, asyncNullOp, noOp, nullOp, nullOpE } from "../src/noOps";

effect("sync no-op helpers return stable outputs",
  Effect.fn(function* () {
    expect(noOp()).toBeUndefined();
    expect(nullOp()).toBeNull();

    const twice = F.pipe(
      [noOp, nullOp],
      A.map((fn) => fn())
    );
    // @ts-expect-error
    expect(twice).toEqual([undefined, null]);
  })
);

effect("async no-ops resolve quickly without side effects",
  Effect.fn(function* () {
    const results = yield* Effect.promise(() =>
      Promise.all(
        F.pipe(
          [asyncNoOp, asyncNullOp],
          A.map((fn) => fn())
        )
      )
    );

    expect(results).toEqual([undefined, null]);
  })
);

effect("nullOpE composes in Effect pipelines",
  Effect.fn(function* () {
    const combined = yield* Effect.gen(function* () {
      const first = yield* nullOpE();
      const second = yield* Effect.succeed("ok");
      return { first, second };
    });

    expect(combined.first).toBeNull();
    expect(combined.second).toBe("ok");
  })
);

effect("no-op helpers keep references stable and callable",
  Effect.fn(function* () {
    const snapshot = [noOp, nullOp, asyncNoOp, asyncNullOp, nullOpE];
    const again = [noOp, nullOp, asyncNoOp, asyncNullOp, nullOpE];

    expect(snapshot).toEqual(again);

    const callbacks = F.pipe(
      [1, 2, 3],
      A.map((value) => (value % 2 === 0 ? nullOp() : noOp()))
    );

    expect(callbacks).toEqual([undefined, null, undefined]);
  })
);
