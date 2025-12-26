import * as F from "@beep/dsl/schema/state/pg/field-defs";
import { describe, expect, test } from "@beep/testkit";
import * as S from "effect/Schema";

describe.concurrent("FieldDefs", () => {
  test("text", () => {
    expect(F.text()).toMatchSnapshot();
    expect(F.text({})).toMatchSnapshot();
    expect(F.text({ default: null, nullable: true })).toMatchSnapshot();
    expect(F.text({ schema: S.Literal("foo"), nullable: true, default: "foo" })).toMatchSnapshot();
    expect(F.text({ schema: S.Union(S.Literal("foo")), nullable: true, default: "foo" })).toMatchSnapshot();
  });

  test("json", () => {
    expect(F.json()).toMatchSnapshot();
    expect(F.json({ default: null, nullable: true })).toMatchSnapshot();
    expect(
      F.json({ schema: S.Struct({ name: S.String }), default: { name: "Bob" }, nullable: true })
    ).toMatchSnapshot();
  });

  test("datetime", () => {
    expect(F.datetime()).toMatchSnapshot();
    expect(F.datetime({})).toMatchSnapshot();
    expect(F.datetime({ default: null, nullable: true })).toMatchSnapshot();
    expect(F.datetime({ default: new Date("2022-02-02") })).toMatchSnapshot();
  });

  test("boolean", () => {
    expect(F.boolean()).toMatchSnapshot();
    expect(F.boolean({})).toMatchSnapshot();
    expect(F.boolean({ default: false })).toMatchSnapshot();
  });
});
