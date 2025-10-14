import { describe, it } from "bun:test";
import { mergeRegistryContent } from "@beep/repo-scripts/iconify/registry";
import { assertTrue, deepStrictEqual, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const baseRegistry = `export const iconSets = {
  /**
   * @set mdi
   */
  "mdi:account": {
    body: "<svg mdi account />",
  },
  /**
   * @set fa
   */
  "fa:home": {
    body: "<svg fa home />",
  },
};
`;

const contains =
  (needle: string) =>
  (haystack: ReadonlyArray<string>): boolean =>
    F.pipe(
      haystack,
      A.some((value) => value === needle)
    );

describe("Iconify registry merge", () => {
  it("adds new icons into existing prefix group", () => {
    const addition = {
      name: "mdi:alert",
      body: "<svg mdi alert />",
    } as const;

    const result = mergeRegistryContent(baseRegistry, [addition]);

    assertTrue(contains(addition.name)(result.added));
    strictEqual(A.length(result.duplicates), 0);
    const alertPosition = F.pipe(
      result.content,
      Str.indexOf(addition.body),
      O.getOrElse(() => -1)
    );
    const faPosition = F.pipe(
      result.content,
      Str.indexOf("fa:home"),
      O.getOrElse(() => Number.MAX_SAFE_INTEGER)
    );
    assertTrue(alertPosition > -1);
    assertTrue(alertPosition < faPosition);
  });

  it("skips duplicates and leaves content unchanged", () => {
    const duplicate = {
      name: "mdi:account",
      body: "<svg different />",
    } as const;

    const result = mergeRegistryContent(baseRegistry, [duplicate]);

    strictEqual(A.length(result.added), 0);
    deepStrictEqual(result.duplicates, ["mdi:account"]);
    assertTrue(F.pipe(result.content, Str.includes("<svg mdi account />")));
    assertTrue(!F.pipe(result.content, Str.includes("<svg different />")));
  });

  it("creates new prefix sections with comment labels", () => {
    const addition = {
      name: "fe:box",
      body: "<svg feather box />",
      setLabel: "Feather Icons",
    } as const;

    const result = mergeRegistryContent(baseRegistry, [addition]);

    assertTrue(result.updated);
    deepStrictEqual(result.added, ["fe:box"]);
    assertTrue(F.pipe(result.content, Str.includes("@set Feather Icons")));
    const boxPosition = F.pipe(
      result.content,
      Str.indexOf("fe:box"),
      O.getOrElse(() => -1)
    );
    const closingPosition = F.pipe(
      result.content,
      Str.lastIndexOf("};"),
      O.getOrElse(() => Number.MAX_SAFE_INTEGER)
    );
    assertTrue(boxPosition > -1);
    assertTrue(boxPosition < closingPosition);
  });
});
