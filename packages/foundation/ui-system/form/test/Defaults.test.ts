import { getDefaultFormValues } from "@beep/form/core/Defaults";
import { withKeyDefaults } from "@beep/schema/SchemaUtils";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

describe("@beep/form getDefaultFormValues", () => {
  it("materializes a schema's constructor defaults", () => {
    const schema = S.Struct({
      name: withKeyDefaults(S.String, ""),
      count: withKeyDefaults(S.Finite, 0),
      active: withKeyDefaults(S.Boolean, false),
    });

    expect(getDefaultFormValues(schema)).toEqual({ name: "", count: 0, active: false });
  });
});
