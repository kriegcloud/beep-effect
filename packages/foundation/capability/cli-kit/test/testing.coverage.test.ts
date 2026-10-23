import { CliTest as DirectCliTest } from "@beep/cli-kit/CliTest";
import { TestTerminal as DirectTerminal } from "@beep/cli-kit/TestTerminal";
import { CliTest, TestTerminal } from "@beep/cli-kit/testing";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("testing entrypoint reexports the hermetic runner and terminal implementations", () =>
  Effect.sync(() => {
    assert.strictEqual(CliTest, DirectCliTest);
    assert.strictEqual(TestTerminal, DirectTerminal);
  })
);
