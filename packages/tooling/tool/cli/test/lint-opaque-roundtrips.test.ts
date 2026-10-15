import { detectOpaqueRoundtrips } from "@beep/repo-cli/commands/Lint/OpaqueRoundtrips";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { Project } from "ts-morph";

const detect = (body: string) => {
  const project = new Project({ tsConfigFilePath: "test/tsconfig.json", skipAddingFilesFromTsConfig: true });
  const source = project.createSourceFile(
    "test/__opaque_roundtrip_fixture.test.ts",
    `
    import * as S from "effect/Schema";
    import * as Result from "effect/Result";
    import * as Arbitrary from "effect/Arbitrary";
    import * as FastCheck from "effect/testing/FastCheck";
    class Value extends S.Opaque<Value, { readonly brand: unique symbol }>()(S.Struct({ value: S.String })) {}
    const Plain = S.Struct({ value: S.String });
    const expect = (actual: unknown) => ({ toStrictEqual: (expected: unknown) => undefined });
    ${body}
  `
  );
  const program = project.getProgram().compilerObject;
  return detectOpaqueRoundtrips({ program, sources: [source.compilerNode] });
};

// Compiler programs are isolated in memory; no fixture is written into the repository.
describe("opaque-roundtrips", () => {
  it.effect(
    "reports raw generated Opaque samples compared with decoded values",
    Effect.fnUntraced(function* () {
      const findings = yield* Effect.sync(() =>
        detect(`
      FastCheck.assert(FastCheck.property(Arbitrary.schema(Value), (sample) => {
        const decoded = Result.getOrThrow(S.decodeUnknownResult(Value)(sample));
        expect(decoded).toStrictEqual(sample);
      }));
    `)
      );
      expect(findings).toHaveLength(1);
      expect(findings[0]?.opaque).toEqual(["Value"]);
      expect(findings[0]?.text).toBe("expect(decoded).toStrictEqual(sample)");
    })
  );

  it.effect(
    "accepts samples normalised with make",
    Effect.fnUntraced(function* () {
      const findings = yield* Effect.sync(() =>
        detect(`
      FastCheck.assert(FastCheck.property(Arbitrary.schema(Value), (sample) => {
        expect(Result.getOrThrow(S.decodeUnknownResult(Value)(sample))).toStrictEqual(Value.make(sample));
      }));
    `)
      );
      expect(findings).toHaveLength(0);
    })
  );

  it.effect(
    "accepts comparisons against a literal empty array",
    Effect.fnUntraced(function* () {
      const findings = yield* Effect.sync(() =>
        detect(`
      FastCheck.assert(FastCheck.property(Arbitrary.schema(Value), (sample) => {
        const decoded = Value.make(sample);
        expect([decoded]).toStrictEqual([]);
      }));
    `)
      );
      expect(findings).toHaveLength(0);
    })
  );

  it.effect(
    "accepts non-Opaque struct roundtrips",
    Effect.fnUntraced(function* () {
      const findings = yield* Effect.sync(() =>
        detect(`
      FastCheck.assert(FastCheck.property(Arbitrary.schema(Plain), (sample) => {
        expect(Result.getOrThrow(S.decodeUnknownResult(Plain)(sample))).toStrictEqual(sample);
      }));
    `)
      );
      expect(findings).toHaveLength(0);
    })
  );
});
