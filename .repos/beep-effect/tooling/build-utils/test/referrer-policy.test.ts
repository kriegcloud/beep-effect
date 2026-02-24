import {
  createReferrerPolicyHeader,
  createReferrerPolicyHeaderValue,
} from "@beep/build-utils/secure-headers/referrer-policy";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runSyncExit(effect);

describe("createReferrerPolicyHeader", () => {
  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createReferrerPolicyHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createReferrerPolicyHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving an object", () => {
    const dummyOption: Parameters<typeof createReferrerPolicyHeader>[0] = "same-origin";

    let headerValueCreatorMock: ReturnType<typeof mock<typeof createReferrerPolicyHeaderValue>>;
    beforeEach(() => {
      headerValueCreatorMock = mock(createReferrerPolicyHeaderValue);
    });

    it("should return Some with Referrer-Policy header when value is provided", async () => {
      const dummyValue = "same-origin";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(createReferrerPolicyHeader(dummyOption, headerValueCreatorMock));

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "Referrer-Policy",
          value: dummyValue,
        });
      }
      expect(headerValueCreatorMock).toBeCalledWith(dummyOption);
    });
  });
});

describe("createReferrerPolicyHeaderValue", () => {
  describe("when giving undefined", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue())).toBeUndefined();
      expect(await runEffect(createReferrerPolicyHeaderValue(null as never))).toBeUndefined();
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue(false))).toBeUndefined();
    });
  });

  describe('when giving "no-referrer"', () => {
    it('should return "no-referrer"', async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue("no-referrer"))).toBe("no-referrer");
    });
  });

  describe('when giving "no-referrer-when-downgrade"', () => {
    it('should return "no-referrer-when-downgrade"', async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue("no-referrer-when-downgrade"))).toBe(
        "no-referrer-when-downgrade"
      );
    });
  });

  describe('when giving "origin"', () => {
    it('should return "origin"', async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue("origin"))).toBe("origin");
    });
  });

  describe('when giving "origin-when-cross-origin"', () => {
    it('should return "origin-when-cross-origin"', async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue("origin-when-cross-origin"))).toBe(
        "origin-when-cross-origin"
      );
    });
  });

  describe('when giving "same-origin"', () => {
    it('should return "same-origin"', async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue("same-origin"))).toBe("same-origin");
    });
  });

  describe('when giving "strict-origin"', () => {
    it('should return "strict-origin"', async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue("strict-origin"))).toBe("strict-origin");
    });
  });

  describe('when giving "strict-origin-when-cross-origin"', () => {
    it('should return "strict-origin-when-cross-origin"', async () => {
      expect(await runEffect(createReferrerPolicyHeaderValue("strict-origin-when-cross-origin"))).toBe(
        "strict-origin-when-cross-origin"
      );
    });
  });

  describe('when giving "unsafe-url"', () => {
    it("should raise error", () => {
      const result = runEffectExit(createReferrerPolicyHeaderValue("unsafe-url" as never));
      expect(Exit.isFailure(result)).toBe(true);
    });
  });

  describe("when giving an array", () => {
    describe("the array has one value", () => {
      it("should return the value", async () => {
        expect(await runEffect(createReferrerPolicyHeaderValue(["no-referrer"]))).toBe("no-referrer");
      });
    });

    describe("the array has two or more values", () => {
      it("should join them using comma and return it as string", async () => {
        expect(
          await runEffect(createReferrerPolicyHeaderValue(["no-referrer", "origin", "strict-origin-when-cross-origin"]))
        ).toBe("no-referrer, origin, strict-origin-when-cross-origin");
      });
    });

    describe("the array has invalid values", () => {
      it("should raise error", () => {
        const result = runEffectExit(
          createReferrerPolicyHeaderValue(["no-referrer", "foo" as never, "origin-when-cross-origin"])
        );
        expect(Exit.isFailure(result)).toBe(true);
      });
    });

    describe("the array has dangerous values", () => {
      it("should raise error", () => {
        const result = runEffectExit(
          createReferrerPolicyHeaderValue(["no-referrer", "unsafe-url" as never, "origin-when-cross-origin"])
        );
        expect(Exit.isFailure(result)).toBe(true);
      });
    });
  });
});
