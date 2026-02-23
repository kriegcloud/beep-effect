import {
  CrossOriginOpenerPolicyHeaderSchema,
  CrossOriginOpenerPolicyOptionSchema,
  createCrossOriginOpenerPolicyHeader,
  createCrossOriginOpenerPolicyHeaderValue,
} from "@beep/build-utils/secure-headers/cross-origin-opener-policy";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option, Schema as S } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runSyncExit(effect);

describe("createCrossOriginOpenerPolicyHeader", () => {
  let headerValueCreatorMock: ReturnType<typeof mock<typeof createCrossOriginOpenerPolicyHeaderValue>>;
  beforeEach(() => {
    headerValueCreatorMock = mock(createCrossOriginOpenerPolicyHeaderValue);
  });

  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createCrossOriginOpenerPolicyHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createCrossOriginOpenerPolicyHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving valid option", () => {
    it("should return Some with Cross-Origin-Opener-Policy header when value is provided", async () => {
      const dummyValue = "same-origin";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(createCrossOriginOpenerPolicyHeader("same-origin", headerValueCreatorMock));

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "Cross-Origin-Opener-Policy",
          value: dummyValue,
        });
      }
    });

    it("should return None when value creator returns undefined", async () => {
      headerValueCreatorMock.mockReturnValue(Effect.void.pipe(Effect.as(undefined)));

      const result = await runEffect(createCrossOriginOpenerPolicyHeader(false, headerValueCreatorMock));

      expect(Option.isNone(result)).toBe(true);
    });
  });
});

describe("createCrossOriginOpenerPolicyHeaderValue", () => {
  describe("when giving undefined", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createCrossOriginOpenerPolicyHeaderValue())).toBeUndefined();
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createCrossOriginOpenerPolicyHeaderValue(false))).toBeUndefined();
    });
  });

  describe('when giving "unsafe-none"', () => {
    it('should return "unsafe-none"', async () => {
      expect(await runEffect(createCrossOriginOpenerPolicyHeaderValue("unsafe-none"))).toBe("unsafe-none");
    });
  });

  describe('when giving "same-origin-allow-popups"', () => {
    it('should return "same-origin-allow-popups"', async () => {
      expect(await runEffect(createCrossOriginOpenerPolicyHeaderValue("same-origin-allow-popups"))).toBe(
        "same-origin-allow-popups"
      );
    });
  });

  describe('when giving "same-origin"', () => {
    it('should return "same-origin"', async () => {
      expect(await runEffect(createCrossOriginOpenerPolicyHeaderValue("same-origin"))).toBe("same-origin");
    });
  });

  describe('when giving "same-origin-plus-COEP"', () => {
    it('should return "same-origin-plus-COEP"', async () => {
      expect(await runEffect(createCrossOriginOpenerPolicyHeaderValue("same-origin-plus-COEP"))).toBe(
        "same-origin-plus-COEP"
      );
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(Exit.isFailure(runEffectExit(createCrossOriginOpenerPolicyHeaderValue("invalid" as never)))).toBe(true);
    });
  });
});

describe("CrossOriginOpenerPolicyOptionSchema", () => {
  it("should accept all valid values", () => {
    expect(S.decodeUnknownSync(CrossOriginOpenerPolicyOptionSchema)("unsafe-none")).toBe("unsafe-none");
    expect(S.decodeUnknownSync(CrossOriginOpenerPolicyOptionSchema)("same-origin-allow-popups")).toBe(
      "same-origin-allow-popups"
    );
    expect(S.decodeUnknownSync(CrossOriginOpenerPolicyOptionSchema)("same-origin")).toBe("same-origin");
    expect(S.decodeUnknownSync(CrossOriginOpenerPolicyOptionSchema)("same-origin-plus-COEP")).toBe(
      "same-origin-plus-COEP"
    );
  });

  it("should accept false", () => {
    expect(S.decodeUnknownSync(CrossOriginOpenerPolicyOptionSchema)(false)).toBe(false);
  });

  it("should reject invalid values", () => {
    expect(() => S.decodeUnknownSync(CrossOriginOpenerPolicyOptionSchema)("invalid")).toThrow();
    expect(() => S.decodeUnknownSync(CrossOriginOpenerPolicyOptionSchema)(123)).toThrow();
  });
});

describe("CrossOriginOpenerPolicyHeaderSchema", () => {
  describe("decode", () => {
    it("should transform undefined to disabled header", () => {
      const result = S.decodeUnknownSync(CrossOriginOpenerPolicyHeaderSchema)(undefined);
      expect(result).toEqual({
        name: "Cross-Origin-Opener-Policy",
        value: undefined,
      });
    });

    it("should transform false to disabled header", () => {
      const result = S.decodeUnknownSync(CrossOriginOpenerPolicyHeaderSchema)(false);
      expect(result).toEqual({
        name: "Cross-Origin-Opener-Policy",
        value: undefined,
      });
    });

    it("should transform valid option to header", () => {
      const result = S.decodeUnknownSync(CrossOriginOpenerPolicyHeaderSchema)("same-origin");
      expect(result).toEqual({
        name: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      });
    });
  });

  describe("encode", () => {
    it("should encode disabled header to false", () => {
      const result = S.encodeSync(CrossOriginOpenerPolicyHeaderSchema)({
        name: "Cross-Origin-Opener-Policy",
        value: undefined,
      });
      expect(result).toBe(false);
    });

    it("should encode enabled header to option value", () => {
      const result = S.encodeSync(CrossOriginOpenerPolicyHeaderSchema)({
        name: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      });
      expect(result).toBe("same-origin");
    });
  });

  describe("round-trip", () => {
    it("should decode then encode back to original", () => {
      const original = "same-origin" as const;
      const decoded = S.decodeUnknownSync(CrossOriginOpenerPolicyHeaderSchema)(original);
      const encoded = S.encodeSync(CrossOriginOpenerPolicyHeaderSchema)(decoded);
      expect(encoded).toBe(original);
    });
  });
});
