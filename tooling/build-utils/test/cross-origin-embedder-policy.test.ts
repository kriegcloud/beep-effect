import {
  createCrossOriginEmbedderPolicyHeader,
  createCrossOriginEmbedderPolicyHeaderValue,
  CrossOriginEmbedderPolicyOptionSchema,
  CrossOriginEmbedderPolicyHeaderSchema,
} from "@beep/build-utils/secure-headers/cross-origin-embedder-policy";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option, Schema as S } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
  Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runSyncExit(effect);

describe("createCrossOriginEmbedderPolicyHeader", () => {
  let headerValueCreatorMock: ReturnType<
    typeof mock<typeof createCrossOriginEmbedderPolicyHeaderValue>
  >;
  beforeEach(() => {
    headerValueCreatorMock = mock(createCrossOriginEmbedderPolicyHeaderValue);
  });

  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createCrossOriginEmbedderPolicyHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createCrossOriginEmbedderPolicyHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving valid option", () => {
    it("should return Some with Cross-Origin-Embedder-Policy header when value is provided", async () => {
      const dummyValue = "require-corp";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(
        createCrossOriginEmbedderPolicyHeader("require-corp", headerValueCreatorMock)
      );

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "Cross-Origin-Embedder-Policy",
          value: dummyValue,
        });
      }
    });

    it("should return None when value creator returns undefined", async () => {
      headerValueCreatorMock.mockReturnValue(Effect.succeed(undefined));

      const result = await runEffect(
        createCrossOriginEmbedderPolicyHeader(false, headerValueCreatorMock)
      );

      expect(Option.isNone(result)).toBe(true);
    });
  });
});

describe("createCrossOriginEmbedderPolicyHeaderValue", () => {
  describe("when giving undefined", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createCrossOriginEmbedderPolicyHeaderValue())).toBeUndefined();
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(
        await runEffect(createCrossOriginEmbedderPolicyHeaderValue(false))
      ).toBeUndefined();
    });
  });

  describe('when giving "unsafe-none"', () => {
    it('should return "unsafe-none"', async () => {
      expect(
        await runEffect(createCrossOriginEmbedderPolicyHeaderValue("unsafe-none"))
      ).toBe("unsafe-none");
    });
  });

  describe('when giving "require-corp"', () => {
    it('should return "require-corp"', async () => {
      expect(
        await runEffect(createCrossOriginEmbedderPolicyHeaderValue("require-corp"))
      ).toBe("require-corp");
    });
  });

  describe('when giving "credentialless"', () => {
    it('should return "credentialless"', async () => {
      expect(
        await runEffect(createCrossOriginEmbedderPolicyHeaderValue("credentialless"))
      ).toBe("credentialless");
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(
        Exit.isFailure(
          runEffectExit(createCrossOriginEmbedderPolicyHeaderValue("invalid" as never))
        )
      ).toBe(true);
    });
  });
});

describe("CrossOriginEmbedderPolicyOptionSchema", () => {
  it("should accept all valid values", () => {
    expect(S.decodeUnknownSync(CrossOriginEmbedderPolicyOptionSchema)("unsafe-none")).toBe("unsafe-none");
    expect(S.decodeUnknownSync(CrossOriginEmbedderPolicyOptionSchema)("require-corp")).toBe("require-corp");
    expect(S.decodeUnknownSync(CrossOriginEmbedderPolicyOptionSchema)("credentialless")).toBe("credentialless");
  });

  it("should accept false", () => {
    expect(S.decodeUnknownSync(CrossOriginEmbedderPolicyOptionSchema)(false)).toBe(false);
  });

  it("should reject invalid values", () => {
    expect(() => S.decodeUnknownSync(CrossOriginEmbedderPolicyOptionSchema)("invalid")).toThrow();
    expect(() => S.decodeUnknownSync(CrossOriginEmbedderPolicyOptionSchema)(123)).toThrow();
  });
});

describe("CrossOriginEmbedderPolicyHeaderSchema", () => {
  describe("decode", () => {
    it("should transform undefined to disabled header", () => {
      const result = S.decodeUnknownSync(CrossOriginEmbedderPolicyHeaderSchema)(undefined);
      expect(result).toEqual({
        name: "Cross-Origin-Embedder-Policy",
        value: undefined,
      });
    });

    it("should transform false to disabled header", () => {
      const result = S.decodeUnknownSync(CrossOriginEmbedderPolicyHeaderSchema)(false);
      expect(result).toEqual({
        name: "Cross-Origin-Embedder-Policy",
        value: undefined,
      });
    });

    it("should transform valid option to header", () => {
      const result = S.decodeUnknownSync(CrossOriginEmbedderPolicyHeaderSchema)("require-corp");
      expect(result).toEqual({
        name: "Cross-Origin-Embedder-Policy",
        value: "require-corp",
      });
    });
  });

  describe("encode", () => {
    it("should encode disabled header to false", () => {
      const result = S.encodeSync(CrossOriginEmbedderPolicyHeaderSchema)({
        name: "Cross-Origin-Embedder-Policy",
        value: undefined,
      });
      expect(result).toBe(false);
    });

    it("should encode enabled header to option value", () => {
      const result = S.encodeSync(CrossOriginEmbedderPolicyHeaderSchema)({
        name: "Cross-Origin-Embedder-Policy",
        value: "require-corp",
      });
      expect(result).toBe("require-corp");
    });
  });

  describe("round-trip", () => {
    it("should decode then encode back to original", () => {
      const original = "require-corp" as const;
      const decoded = S.decodeUnknownSync(CrossOriginEmbedderPolicyHeaderSchema)(original);
      const encoded = S.encodeSync(CrossOriginEmbedderPolicyHeaderSchema)(decoded);
      expect(encoded).toBe(original);
    });
  });
});
