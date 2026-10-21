import * as Entry from "@beep/github-commands";
import { CommandNeutralizer } from "@beep/github-commands/CommandNeutralizer";
import { AnnotationProperties, WorkflowCommand } from "@beep/github-commands/WorkflowCommand";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("github-commands entrypoint", () => {
  it.effect("exports the same schema and utilities as their defining modules", () =>
    Effect.sync(() => {
      assert.strictEqual(Entry.AnnotationProperties, AnnotationProperties);
      assert.strictEqual(Entry.WorkflowCommand, WorkflowCommand);
      assert.strictEqual(Entry.CommandNeutralizer, CommandNeutralizer);
      assert.strictEqual(Entry.WorkflowCommand.debug("trace"), "::debug::trace");
      assert.strictEqual(Entry.CommandNeutralizer.text("::debug::trace"), "\u200b::debug::trace");
    })
  );
});
