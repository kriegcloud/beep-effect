import { $ScratchId } from "@beep/identity";
import { decodeYamlTextAs, parseYaml, YamlTextToUnknown } from "@beep/schema/Yaml";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import * as S from "effect/Schema";
import * as yaml from "yaml";
import { makeParseYaml, makeParseYamlForSchema } from "../src/internal/yaml.ts";

const $I = $ScratchId.create("yaml_test");

class YamlPerson extends S.Class<YamlPerson>($I`YamlPerson`)(
  {
    name: S.String,
    age: S.Number,
  },
  $I.annote("YamlPerson", {
    description: "Typed YAML person fixture used in schema tests.",
  })
) {}

describe("Yaml", () => {
  it("parses YAML text with the public parseYaml helper", () => {
    expect(parseYaml("name: Ada\nskills:\n  - Effect\n  - Bun")).toEqual({
      name: "Ada",
      skills: ["Effect", "Bun"],
    });
  });

  it("prefers the Bun runtime parser when one is provided", () => {
    const parseWithBun = makeParseYaml(
      {
        Bun: {
          YAML: {
            parse: (input) => ({
              parser: "bun",
              input,
            }),
          },
        },
      },
      () => yaml
    );

    expect(parseWithBun("name: Ada")).toEqual({
      parser: "bun",
      input: "name: Ada",
    });
  });

  it("falls back to the yaml package when Bun is unavailable", () => {
    const parseWithoutBun = makeParseYaml({}, () => yaml);

    expect(parseWithoutBun("name: Ada\nage: 36")).toEqual({
      name: "Ada",
      age: 36,
    });
  });

  it("reports fallback parse diagnostics through the internal schema parser seam", () => {
    const parseWithoutBun = makeParseYamlForSchema({}, () => yaml);
    const result = parseWithoutBun("name: [Ada");

    expect(result._tag).toBe("failure");
    if (result._tag === "failure") {
      expect(result.messages.join("; ")).toContain("Flow sequence in block collection");
    }
  });

  it.effect("decodes YAML text into typed schema values", () =>
    Effect.gen(function* () {
      const person = yield* decodeYamlTextAs(YamlPerson)("name: Ada\nage: 36");

      expect(person).toBeInstanceOf(YamlPerson);
      expect(person.name).toBe("Ada");
      expect(person.age).toBe(36);
    })
  );

  it.effect("maps invalid YAML into SchemaIssue.InvalidValue", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(S.decodeUnknownEffect(YamlTextToUnknown)("name: [Ada"));

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Invalid YAML input");
      }
    })
  );

  it.effect("fails to encode unknown values back into YAML text", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        S.encodeEffect(YamlTextToUnknown)({
          name: "Ada",
        })
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Encoding unknown values to YAML text is not supported");
      }
    })
  );
});
