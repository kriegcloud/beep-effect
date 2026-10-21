import * as GitModule from "@beep/git";
import { GitCommand } from "@beep/git/GitCommand";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("GitCommand coverage", () => {
  it.effect("the static command container remains constructible to JavaScript reflection", () =>
    Effect.sync(() => {
      const container: object = Reflect.construct(GitCommand, []);
      assert.strictEqual(Reflect.getPrototypeOf(container), GitCommand.prototype);
      assert.strictEqual(GitModule.GitCommand, GitCommand);
      assert.deepStrictEqual(GitModule.GitCommand.show("HEAD", "file").command.args, ["show", "HEAD:file"]);
    })
  );
});
