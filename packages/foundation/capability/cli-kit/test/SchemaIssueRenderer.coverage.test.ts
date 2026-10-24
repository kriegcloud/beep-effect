import { SchemaIssueRenderer } from "@beep/cli-kit/SchemaIssueRenderer";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("SchemaIssueRenderer retains its runtime class identity", () =>
  Effect.sync(() => {
    const instance: unknown = Reflect.construct(SchemaIssueRenderer, []);
    assert.isTrue(instance instanceof SchemaIssueRenderer);
  })
);
