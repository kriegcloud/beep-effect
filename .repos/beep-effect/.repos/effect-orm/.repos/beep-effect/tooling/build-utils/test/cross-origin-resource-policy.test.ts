import {
  CrossOriginResourcePolicyHeaderSchema,
  CrossOriginResourcePolicyOptionSchema,
  createCrossOriginResourcePolicyHeader,
  createCrossOriginResourcePolicyHeaderValue,
} from "@beep/build-utils/secure-headers/cross-origin-resource-policy";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option, Schema as S } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runSyncExit(effect);

describe("createCrossOriginResourcePolicyHeader", () => {
  let headerValueCreatorMock: ReturnType<typeof mock<typeof createCrossOriginResourcePolicyHeaderValue>>;
  beforeEach(() => {
    headerValueCreatorMock = mock(createCrossOriginResourcePolicyHeaderValue);
  });

  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createCrossOriginResourcePolicyHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createCrossOriginResourcePolicyHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving valid option", () => {
    it("should return Some with Cross-Origin-Resource-Policy header when value is provided", async () => {
      const dummyValue = "same-origin";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(createCrossOriginResourcePolicyHeader("same-origin", headerValueCreatorMock));

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "Cross-Origin-Resource-Policy",
          value: dummyValue,
        });
      }
    });

    it("should return None when value creator returns undefined", async () => {
      headerValueCreatorMock.mockReturnValue(Effect.succeed(undefined));

      const result = await runEffect(createCrossOriginResourcePolicyHeader(false, headerValueCreatorMock));

      expect(Option.isNone(result)).toBe(true);
    });
  });
});

describe("createCrossOriginResourcePolicyHeaderValue", () => {
  describe("when giving undefined", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createCrossOriginResourcePolicyHeaderValue())).toBeUndefined();
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createCrossOriginResourcePolicyHeaderValue(false))).toBeUndefined();
    });
  });

  describe('when giving "same-site"', () => {
    it('should return "same-site"', async () => {
      expect(await runEffect(createCrossOriginResourcePolicyHeaderValue("same-site"))).toBe("same-site");
    });
  });

  describe('when giving "same-origin"', () => {
    it('should return "same-origin"', async () => {
      expect(await runEffect(createCrossOriginResourcePolicyHeaderValue("same-origin"))).toBe("same-origin");
    });
  });

  describe('when giving "cross-origin"', () => {
    it('should return "cross-origin"', async () => {
      expect(await runEffect(createCrossOriginResourcePolicyHeaderValue("cross-origin"))).toBe("cross-origin");
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(Exit.isFailure(runEffectExit(createCrossOriginResourcePolicyHeaderValue("invalid" as never)))).toBe(true);
    });
  });
});

describe("CrossOriginResourcePolicyOptionSchema", () => {
  it("should accept all valid values", () => {
    expect(S.decodeUnknownSync(CrossOriginResourcePolicyOptionSchema)("same-site")).toBe("same-site");
    expect(S.decodeUnknownSync(CrossOriginResourcePolicyOptionSchema)("same-origin")).toBe("same-origin");
    expect(S.decodeUnknownSync(CrossOriginResourcePolicyOptionSchema)("cross-origin")).toBe("cross-origin");
  });

  it("should accept false", () => {
    expect(S.decodeUnknownSync(CrossOriginResourcePolicyOptionSchema)(false)).toBe(false);
  });

  it("should reject invalid values", () => {
    expect(() => S.decodeUnknownSync(CrossOriginResourcePolicyOptionSchema)("invalid")).toThrow();
    expect(() => S.decodeUnknownSync(CrossOriginResourcePolicyOptionSchema)(123)).toThrow();
  });
});

describe("CrossOriginResourcePolicyHeaderSchema", () => {
  describe("decode", () => {
    it("should transform undefined to disabled header", () => {
      const result = S.decodeUnknownSync(CrossOriginResourcePolicyHeaderSchema)(undefined);
      expect(result).toEqual({
        name: "Cross-Origin-Resource-Policy",
        value: undefined,
      });
    });

    it("should transform false to disabled header", () => {
      const result = S.decodeUnknownSync(CrossOriginResourcePolicyHeaderSchema)(false);
      expect(result).toEqual({
        name: "Cross-Origin-Resource-Policy",
        value: undefined,
      });
    });

    it("should transform valid option to header", () => {
      const result = S.decodeUnknownSync(CrossOriginResourcePolicyHeaderSchema)("same-origin");
      expect(result).toEqual({
        name: "Cross-Origin-Resource-Policy",
        value: "same-origin",
      });
    });
  });

  describe("encode", () => {
    it("should encode disabled header to false", () => {
      const result = S.encodeSync(CrossOriginResourcePolicyHeaderSchema)({
        name: "Cross-Origin-Resource-Policy",
        value: undefined,
      });
      expect(result).toBe(false);
    });

    it("should encode enabled header to option value", () => {
      const result = S.encodeSync(CrossOriginResourcePolicyHeaderSchema)({
        name: "Cross-Origin-Resource-Policy",
        value: "same-origin",
      });
      expect(result).toBe("same-origin");
    });
  });

  describe("round-trip", () => {
    it("should decode then encode back to original", () => {
      const original = "same-origin" as const;
      const decoded = S.decodeUnknownSync(CrossOriginResourcePolicyHeaderSchema)(original);
      const encoded = S.encodeSync(CrossOriginResourcePolicyHeaderSchema)(decoded);
      expect(encoded).toBe(original);
    });
  });
});
