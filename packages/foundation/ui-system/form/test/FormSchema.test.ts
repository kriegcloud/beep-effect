import { toFormSchema } from "@beep/form/core/FormSchema";
import { schemaPathToFieldPath } from "@beep/form/core/Path";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const schema = S.Struct({ name: S.NonEmptyString });

describe("@beep/form toFormSchema", () => {
  it("produces an effect-vendored Standard Schema", () => {
    const standard = toFormSchema(schema);
    expect(standard["~standard"].vendor).toBe("effect");
    expect(standard["~standard"].version).toBe(1);
  });

  it("validates a conforming value synchronously", () => {
    const standard = toFormSchema(schema);
    const result = standard["~standard"].validate({ name: "ada" });
    expect(result).not.toBeInstanceOf(Promise);
    expect(result).toEqual({ value: { name: "ada" } });
  });

  it("reports issues bucketed by field path", () => {
    const standard = toFormSchema(schema);
    const result = standard["~standard"].validate({ name: "" });
    expect(result).not.toBeInstanceOf(Promise);
    if (!(result instanceof Promise) && "issues" in result) {
      const issues = result.issues ?? [];
      expect(issues.length).toBeGreaterThan(0);
      expect(schemaPathToFieldPath(issues[0]?.path)).toBe("name");
    }
  });
});
