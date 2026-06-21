import { formOptionsWithDefaults, makeFormOptions } from "@beep/form/core/FormOptions";
import { withKeyDefaults } from "@beep/schema/SchemaUtils";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const schema = S.Struct({ name: withKeyDefaults(S.String, "") });

describe("@beep/form FormOptions", () => {
  it("makeFormOptions wires explicit defaults and a sync submit validator", () => {
    const options = makeFormOptions({ schema, defaultValues: { name: "x" } });
    expect(options.defaultValues).toEqual({ name: "x" });
    expect(options.validators && "onSubmit" in options.validators).toBe(true);
  });

  it("formOptionsWithDefaults derives defaults from the schema", () => {
    const options = formOptionsWithDefaults({ schema });
    expect(options.defaultValues).toEqual({ name: "" });
  });

  it("encodes schema defaults for transform schemas", () => {
    const transformedSchema = S.Struct({
      count: S.FiniteFromString.pipe(S.withConstructorDefault(Effect.succeed(1))),
    });

    const options = formOptionsWithDefaults({ schema: transformedSchema });

    expect(options.defaultValues).toEqual({ count: "1" });
  });

  it("routes to the async slot when async is requested", () => {
    const options = makeFormOptions({
      schema,
      defaultValues: { name: "x" },
      validateOn: "change",
      async: true,
    });
    expect(options.validators && "onChangeAsync" in options.validators).toBe(true);
  });
});
