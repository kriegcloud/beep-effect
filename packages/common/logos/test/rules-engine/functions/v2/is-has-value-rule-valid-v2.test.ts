import { HasValueRule } from "@beep/logos/v2/rules"; // adjust import to your path
import { BS } from "@beep/schema";
import type * as R from "effect/Record";
import * as S from "effect/Schema";
import { describe, expect, test } from "vitest";

const asJson = <A>(a: A) => (S.is(BS.Json)(a) ? (a as BS.Json.Type) : a);

describe("HasValueRule.validate", () => {
  test("contains — primitive", () => {
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "contains", value: "bob" },
    });
    const rec: R.ReadonlyRecord<string, BS.Json.Type> = {
      a: "alice",
      b: "bob",
    };
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("notContains — primitive", () => {
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "notContains", value: 42 },
    });
    const rec: R.ReadonlyRecord<string, BS.Json.Type> = { a: "x", b: "y" };
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("contains — deep object equality", () => {
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "contains", value: asJson({ k: "v", n: [1, 2, 3] }) },
    });
    const rec: R.ReadonlyRecord<string, BS.Json.Type> = {
      a: asJson({ k: "v", n: [1, 2, 3] }),
      b: "other",
    };
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("inSet — at least one overlap", () => {
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "inSet", value: ["x", "y"] },
    });
    const rec = { a: "nope", b: "y" };
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("oneOf — exactly one DISTINCT overlap (ignore duplicates in values)", () => {
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "oneOf", value: ["y", "z"] },
    });
    // values contain "y" multiple times but that still counts as exactly one distinct overlap
    const rec = { a: "y", b: "y", c: "a" };
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("noneOf — no overlap", () => {
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "noneOf", value: ["p", "q"] },
    });
    const rec = { a: "x", b: "y" };
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("allOf — every selection element present", () => {
    const sel = [asJson({ id: 1 }), asJson(["a", "b"])] as const;
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "allOf", value: sel },
    });
    const rec = { a: sel[0], b: sel[1], c: "extra" };
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("allOf — missing one element", () => {
    const rule = HasValueRule.make({
      field: "any",
      op: { _tag: "allOf", value: ["x", "y"] },
    });
    const rec = { a: "x", b: "z" };
    expect(HasValueRule.validate(rule, rec)).toBeFalsy();
  });

  test("non-JSON values in record are ignored (defensive filter)", () => {
    const rule: HasValueRule.Input.Type = {
      field: "any",
      type: "hasValue",
      op: { _tag: "contains", value: "ok" },
    };
    // function is not JSON; it should not break or match anything
    const rec = { a: "ok", b: () => 1 };
    // @ts-expect-error
    expect(HasValueRule.validate(rule, rec)).toBeTruthy();
  });

  test("invalid operator tag falls back to false", () => {
    const rule: HasValueRule.Input.Type = {
      field: "any",
      type: "hasValue",
      // @ts-expect-error
      op: { _tag: "definitely_not_real", value: "x" },
    };
    const rec = { a: "x" };
    expect(HasValueRule.validate(rule, rec)).toBeFalsy();
  });
});
