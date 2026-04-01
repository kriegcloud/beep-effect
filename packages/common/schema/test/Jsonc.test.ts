import { $ScratchId } from "@beep/identity";
import { decodeJsoncTextAs, JsoncTextToUnknown } from "@beep/schema/Jsonc";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import * as S from "effect/Schema";

const $I = $ScratchId.create("jsonc_test");

class JsoncPerson extends S.Class<JsoncPerson>($I`JsoncPerson`)(
  {
    name: S.String,
    age: S.Number,
  },
  $I.annote("JsoncPerson", {
    description: "Typed JSONC person fixture used in schema tests.",
  })
) {}

describe("Jsonc", () => {
  it.effect("decodes JSONC text with comments and trailing commas into typed schema values", () =>
    Effect.gen(function* () {
      const person = yield* decodeJsoncTextAs(JsoncPerson)(`{
        // comment
        "name": "Ada",
        "age": 36,
      }`);

      expect(person).toBeInstanceOf(JsoncPerson);
      expect(person.name).toBe("Ada");
      expect(person.age).toBe(36);
    })
  );

  it.effect("maps invalid JSONC into SchemaIssue.InvalidValue", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(S.decodeUnknownEffect(JsoncTextToUnknown)(`{ "name": }`));

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Invalid JSONC input");
        expect(rendered).toContain("ValueExpected");
      }
    })
  );

  it.effect("fails to encode unknown values back into JSONC text", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        S.encodeEffect(JsoncTextToUnknown)({
          name: "Ada",
        })
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Encoding unknown values to JSONC text is not supported");
      }
    })
  );
});
