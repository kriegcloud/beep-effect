import * as Public from "@beep/github-references";
import * as Lists from "@beep/github-references/ClosingList";
import * as Issues from "@beep/github-references/IssueReferences";
import * as Families from "@beep/github-references/KeywordFamily";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("github-references public barrel", () => {
  it.effect("reexports every owned public value with its original identity", () =>
    Effect.sync(() => {
      const expected = { ...Lists, ...Issues, ...Families };
      assert.deepStrictEqual(Object.keys(Public).sort(), Object.keys(expected).sort());
      for (const key of Object.keys(expected)) {
        assert.strictEqual(Reflect.get(Public, key), Reflect.get(expected, key));
      }
      assert.strictEqual(Public.keywordFamily("references"), "ref");
    })
  );
});
