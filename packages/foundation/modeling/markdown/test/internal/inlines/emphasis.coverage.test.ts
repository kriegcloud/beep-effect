import { DelimiterRun, scanDelims } from "@beep/markdown/internal/inlines/emphasis";
import { assert, it } from "@effect/vitest";
import { assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import { fakeScanner } from "./fakeScanner.ts";

it.effect("classifies a leading unmatched low surrogate without looking before the source", () =>
  Effect.sync(() => {
    const scanner = fakeScanner("\udc00*a");
    scanner.pos = 1;
    assertSome(scanDelims(scanner, "*"), DelimiterRun.make({ numdelims: 1, canOpen: true, canClose: true }));
    assert.strictEqual(scanner.pos, 1);
  })
);
