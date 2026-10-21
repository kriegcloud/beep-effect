import * as Public from "@beep/github-references";
import * as Lists from "@beep/github-references/ClosingList";
import * as Issues from "@beep/github-references/IssueReferences";
import * as Families from "@beep/github-references/KeywordFamily";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";

describe("github-references public barrel", () => {
  it.effect("reexports every owned public value with its original identity", () =>
    Effect.sync(() => {
      const expected = { ...Lists, ...Issues, ...Families };
      assert.deepStrictEqual(R.keys(Public).sort(), R.keys(expected).sort());
      for (const key of R.keys(expected)) {
        assert.strictEqual(Reflect.get(Public, key), Reflect.get(expected, key));
      }
      assert.strictEqual(Public.keywordFamily("references"), "ref");
    })
  );
});
