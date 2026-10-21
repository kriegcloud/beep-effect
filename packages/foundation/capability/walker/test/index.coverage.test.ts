import * as Public from "@beep/walker";
import { DescendError, DescendResult, descend, UnreadableDirectory } from "@beep/walker/Descend";
import { CompileAndExpandOptions, compileAndExpand, GlobExpansionError } from "@beep/walker/Expand";
import { AscendOptions, Walker } from "@beep/walker/Walker";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("the entrypoint exposes the same traversal operations and schemas as the concept modules", () =>
  Effect.sync(() => {
    assert.strictEqual(Public.DescendError, DescendError);
    assert.strictEqual(Public.DescendResult, DescendResult);
    assert.strictEqual(Public.UnreadableDirectory, UnreadableDirectory);
    assert.strictEqual(Public.descend, descend);
    assert.strictEqual(Public.CompileAndExpandOptions, CompileAndExpandOptions);
    assert.strictEqual(Public.GlobExpansionError, GlobExpansionError);
    assert.strictEqual(Public.compileAndExpand, compileAndExpand);
    assert.strictEqual(Public.AscendOptions, AscendOptions);
    assert.strictEqual(Public.Walker, Walker);
  })
);
