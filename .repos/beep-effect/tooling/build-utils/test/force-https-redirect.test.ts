import {
  createForceHTTPSRedirectHeader,
  createHSTSHeaderValue,
} from "@beep/build-utils/secure-headers/force-https-redirect";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runSyncExit(effect);

describe("createForceHTTPSRedirectHeader", () => {
  let headerValueCreatorMock: ReturnType<typeof mock<typeof createHSTSHeaderValue>>;
  beforeEach(() => {
    headerValueCreatorMock = mock(createHSTSHeaderValue);
  });

  it("should return Some with Strict-Transport-Security header when value is provided", async () => {
    const dummyValue = "max-age=123";
    headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

    const result = await runEffect(createForceHTTPSRedirectHeader(undefined, headerValueCreatorMock));

    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value).toEqual({
        name: "Strict-Transport-Security",
        value: dummyValue,
      });
    }
    expect(headerValueCreatorMock).toBeCalledWith(undefined);
  });

  it("should return None when value creator returns undefined", async () => {
    headerValueCreatorMock.mockReturnValue(Effect.void.pipe(Effect.as(undefined)));

    const result = await runEffect(createForceHTTPSRedirectHeader(false, headerValueCreatorMock));

    expect(Option.isNone(result)).toBe(true);
    expect(headerValueCreatorMock).toBeCalledWith(false);
  });
});

describe("createHSTSHeaderValue", () => {
  const secondsOfTwoYears = 60 * 60 * 24 * 365 * 2;

  describe("when giving undefined", () => {
    it('should return "max-age" set two years', async () => {
      expect(await runEffect(createHSTSHeaderValue())).toBe(`max-age=${secondsOfTwoYears}`);
      expect(await runEffect(createHSTSHeaderValue(null as never))).toBe(`max-age=${secondsOfTwoYears}`);
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createHSTSHeaderValue(false))).toBeUndefined();
    });
  });

  describe("when giving true", () => {
    it('should return "max-age" set two years', async () => {
      expect(await runEffect(createHSTSHeaderValue(true))).toBe(`max-age=${secondsOfTwoYears}`);
    });
  });

  describe("when giving an array with options", () => {
    describe("giving true in the first element with empty options", () => {
      it('should return "max-age" set two years', async () => {
        expect(await runEffect(createHSTSHeaderValue([true, {}]))).toBe(`max-age=${secondsOfTwoYears}`);
      });
    });
  });

  describe('when specifying "maxAge" option', () => {
    describe("the number is valid", () => {
      it('should return "max-age" set the number', async () => {
        const dummyAge = 123;
        expect(await runEffect(createHSTSHeaderValue([true, { maxAge: dummyAge }]))).toBe(`max-age=${dummyAge}`);
      });
    });

    describe("the number is invalid", () => {
      it("should raise error", () => {
        expect(Exit.isFailure(runEffectExit(createHSTSHeaderValue([true, { maxAge: Number.NaN }])))).toBe(true);
        expect(Exit.isFailure(runEffectExit(createHSTSHeaderValue([true, { maxAge: Number.POSITIVE_INFINITY }])))).toBe(
          true
        );
      });
    });
  });

  describe('when specifying "includeSubDomains" option', () => {
    describe("the option is false", () => {
      it('should return only "max-age"', async () => {
        expect(await runEffect(createHSTSHeaderValue([true, { includeSubDomains: false }]))).toBe(
          `max-age=${secondsOfTwoYears}`
        );
      });
    });

    describe("the option is true", () => {
      it('should return "max-age" and "includeSubDomains"', async () => {
        expect(await runEffect(createHSTSHeaderValue([true, { includeSubDomains: true }]))).toBe(
          `max-age=${secondsOfTwoYears}; includeSubDomains`
        );
      });
    });
  });

  describe('when specifying "preload" option', () => {
    describe("the option is false", () => {
      it('should return only "max-age"', async () => {
        expect(await runEffect(createHSTSHeaderValue([true, { preload: false }]))).toBe(`max-age=${secondsOfTwoYears}`);
      });
    });

    describe("the option is true", () => {
      it('should return "max-age" and "preload"', async () => {
        expect(await runEffect(createHSTSHeaderValue([true, { preload: true }]))).toBe(
          `max-age=${secondsOfTwoYears}; preload`
        );
      });
    });
  });

  describe("when specifying all options", () => {
    describe("the options are false", () => {
      it('should return only "max-age"', async () => {
        expect(await runEffect(createHSTSHeaderValue([true, { includeSubDomains: false, preload: false }]))).toBe(
          `max-age=${secondsOfTwoYears}`
        );

        const dummyAge = 123;
        expect(
          await runEffect(createHSTSHeaderValue([true, { maxAge: dummyAge, includeSubDomains: false, preload: false }]))
        ).toBe(`max-age=${dummyAge}`);
      });
    });

    describe("the options are true", () => {
      it('should return "max-age" and the options', async () => {
        expect(await runEffect(createHSTSHeaderValue([true, { includeSubDomains: true, preload: true }]))).toBe(
          `max-age=${secondsOfTwoYears}; includeSubDomains; preload`
        );

        const dummyAge = 123;
        expect(
          await runEffect(createHSTSHeaderValue([true, { maxAge: dummyAge, includeSubDomains: true, preload: true }]))
        ).toBe(`max-age=${dummyAge}; includeSubDomains; preload`);
      });
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(Exit.isFailure(runEffectExit(createHSTSHeaderValue("foo" as never)))).toBe(true);
      expect(Exit.isFailure(runEffectExit(createHSTSHeaderValue([] as never)))).toBe(true);
    });
  });
});
