import * as Package from "@beep/github-reporting";
import * as CheckDocumentModule from "@beep/github-reporting/CheckDocument";
import * as CheckStateModule from "@beep/github-reporting/CheckState";
import * as ManagedDocumentModule from "@beep/github-reporting/ManagedDocument";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as Str from "effect/String";

const runtimeExports = (module: Readonly<Record<string, unknown>>): ReadonlyArray<string> =>
  A.sort(R.keys(module), Str.Order);

describe("@beep/github-reporting root entry point", () => {
  it("re-exports every runtime member of CheckState, ManagedDocument and CheckDocument, and nothing else", () => {
    const expected = A.sort(
      A.flatMap([CheckDocumentModule, CheckStateModule, ManagedDocumentModule], runtimeExports),
      Str.Order
    );
    assert.deepStrictEqual(runtimeExports(Package), expected);
  });

  it("re-exports the leaf bindings themselves, not copies", () => {
    assert.strictEqual(Package.CheckDocument, CheckDocumentModule.CheckDocument);
    assert.strictEqual(Package.CheckState, CheckStateModule.CheckState);
    assert.strictEqual(Package.ManagedDocument, ManagedDocumentModule.ManagedDocument);
  });

  it("keeps GitHubMarkdown off the root: it is subpath-only", () => {
    assert.notInclude(runtimeExports(Package), "GitHubMarkdown");
    assert.notInclude(runtimeExports(Package), "GitHubListOptions");
  });
});
