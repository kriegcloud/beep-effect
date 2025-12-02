import {
  createPermittedCrossDomainPoliciesHeader,
  createPermittedCrossDomainPoliciesHeaderValue,
  PermittedCrossDomainPoliciesOptionSchema,
  PermittedCrossDomainPoliciesHeaderSchema,
} from "@beep/build-utils/secure-headers/permitted-cross-domain-policies";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option, Schema as S } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
  Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runSyncExit(effect);

describe("createPermittedCrossDomainPoliciesHeader", () => {
  let headerValueCreatorMock: ReturnType<
    typeof mock<typeof createPermittedCrossDomainPoliciesHeaderValue>
  >;
  beforeEach(() => {
    headerValueCreatorMock = mock(createPermittedCrossDomainPoliciesHeaderValue);
  });

  describe("when giving undefined", () => {
    it('should return Some with value "none" (default)', async () => {
      const result = await runEffect(createPermittedCrossDomainPoliciesHeader());
      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "X-Permitted-Cross-Domain-Policies",
          value: "none",
        });
      }
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createPermittedCrossDomainPoliciesHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving valid option", () => {
    it("should return Some with X-Permitted-Cross-Domain-Policies header when value is provided", async () => {
      const dummyValue = "master-only";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(
        createPermittedCrossDomainPoliciesHeader("master-only", headerValueCreatorMock)
      );

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "X-Permitted-Cross-Domain-Policies",
          value: dummyValue,
        });
      }
    });

    it("should return None when value creator returns undefined", async () => {
      headerValueCreatorMock.mockReturnValue(Effect.succeed(undefined));

      const result = await runEffect(
        createPermittedCrossDomainPoliciesHeader(false, headerValueCreatorMock)
      );

      expect(Option.isNone(result)).toBe(true);
    });
  });
});

describe("createPermittedCrossDomainPoliciesHeaderValue", () => {
  describe("when giving undefined", () => {
    it('should return "none" (secure default)', async () => {
      expect(await runEffect(createPermittedCrossDomainPoliciesHeaderValue())).toBe("none");
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(
        await runEffect(createPermittedCrossDomainPoliciesHeaderValue(false))
      ).toBeUndefined();
    });
  });

  describe('when giving "none"', () => {
    it('should return "none"', async () => {
      expect(
        await runEffect(createPermittedCrossDomainPoliciesHeaderValue("none"))
      ).toBe("none");
    });
  });

  describe('when giving "master-only"', () => {
    it('should return "master-only"', async () => {
      expect(
        await runEffect(createPermittedCrossDomainPoliciesHeaderValue("master-only"))
      ).toBe("master-only");
    });
  });

  describe('when giving "by-content-type"', () => {
    it('should return "by-content-type"', async () => {
      expect(
        await runEffect(createPermittedCrossDomainPoliciesHeaderValue("by-content-type"))
      ).toBe("by-content-type");
    });
  });

  describe('when giving "by-ftp-filename"', () => {
    it('should return "by-ftp-filename"', async () => {
      expect(
        await runEffect(createPermittedCrossDomainPoliciesHeaderValue("by-ftp-filename"))
      ).toBe("by-ftp-filename");
    });
  });

  describe('when giving "all"', () => {
    it('should return "all"', async () => {
      expect(
        await runEffect(createPermittedCrossDomainPoliciesHeaderValue("all"))
      ).toBe("all");
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(
        Exit.isFailure(
          runEffectExit(createPermittedCrossDomainPoliciesHeaderValue("invalid" as never))
        )
      ).toBe(true);
    });
  });
});

describe("PermittedCrossDomainPoliciesOptionSchema", () => {
  it("should accept all valid values", () => {
    expect(S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)("none")).toBe("none");
    expect(S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)("master-only")).toBe("master-only");
    expect(S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)("by-content-type")).toBe("by-content-type");
    expect(S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)("by-ftp-filename")).toBe("by-ftp-filename");
    expect(S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)("all")).toBe("all");
  });

  it("should accept false", () => {
    expect(S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)(false)).toBe(false);
  });

  it("should reject invalid values", () => {
    expect(() => S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)("invalid")).toThrow();
    expect(() => S.decodeUnknownSync(PermittedCrossDomainPoliciesOptionSchema)(123)).toThrow();
  });
});

describe("PermittedCrossDomainPoliciesHeaderSchema", () => {
  describe("decode", () => {
    it('should transform undefined to "none" (secure default)', () => {
      const result = S.decodeUnknownSync(PermittedCrossDomainPoliciesHeaderSchema)(undefined);
      expect(result).toEqual({
        name: "X-Permitted-Cross-Domain-Policies",
        value: "none",
      });
    });

    it("should transform false to disabled header", () => {
      const result = S.decodeUnknownSync(PermittedCrossDomainPoliciesHeaderSchema)(false);
      expect(result).toEqual({
        name: "X-Permitted-Cross-Domain-Policies",
        value: undefined,
      });
    });

    it("should transform valid option to header", () => {
      const result = S.decodeUnknownSync(PermittedCrossDomainPoliciesHeaderSchema)("master-only");
      expect(result).toEqual({
        name: "X-Permitted-Cross-Domain-Policies",
        value: "master-only",
      });
    });
  });

  describe("encode", () => {
    it("should encode disabled header to false", () => {
      const result = S.encodeSync(PermittedCrossDomainPoliciesHeaderSchema)({
        name: "X-Permitted-Cross-Domain-Policies",
        value: undefined,
      });
      expect(result).toBe(false);
    });

    it("should encode enabled header to option value", () => {
      const result = S.encodeSync(PermittedCrossDomainPoliciesHeaderSchema)({
        name: "X-Permitted-Cross-Domain-Policies",
        value: "master-only",
      });
      expect(result).toBe("master-only");
    });
  });

  describe("round-trip", () => {
    it("should decode then encode back to original", () => {
      const original = "master-only" as const;
      const decoded = S.decodeUnknownSync(PermittedCrossDomainPoliciesHeaderSchema)(original);
      const encoded = S.encodeSync(PermittedCrossDomainPoliciesHeaderSchema)(decoded);
      expect(encoded).toBe(original);
    });
  });
});
