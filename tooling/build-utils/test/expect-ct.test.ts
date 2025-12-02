import {
  createExpectCTHeader,
  createExpectCTHeaderValue,
} from "@beep/build-utils/secure-headers/expect-ct";
import { encodeStrictURI } from "@beep/build-utils/secure-headers/helpers";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
  Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runSyncExit(effect);

describe("createExpectCTHeader", () => {
  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createExpectCTHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createExpectCTHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving an object", () => {
    const dummyOption: Parameters<typeof createExpectCTHeader>[0] = [
      true,
      { maxAge: 123 },
    ];

    let headerValueCreatorMock: ReturnType<
      typeof mock<typeof createExpectCTHeaderValue>
    >;
    beforeEach(() => {
      headerValueCreatorMock = mock(createExpectCTHeaderValue);
    });

    it("should return Some with Expect-CT header when value is provided", async () => {
      const dummyValue = "max-age=123";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(
        createExpectCTHeader(dummyOption, headerValueCreatorMock)
      );

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({ name: "Expect-CT", value: dummyValue });
      }
      expect(headerValueCreatorMock).toBeCalledWith(dummyOption);
    });
  });
});

describe("createExpectCTHeaderValue", () => {
  const secondsOfOneDay = 60 * 60 * 24;

  describe("when giving undefined", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createExpectCTHeaderValue())).toBeUndefined();
      expect(
        await runEffect(createExpectCTHeaderValue(null as never))
      ).toBeUndefined();
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createExpectCTHeaderValue(false))).toBeUndefined();
    });
  });

  describe("when giving true", () => {
    it('should return "max-age" set one day', async () => {
      expect(await runEffect(createExpectCTHeaderValue(true))).toBe(
        `max-age=${secondsOfOneDay}`
      );
    });
  });

  describe("when giving an array without any options", () => {
    describe("giving false in the first element", () => {
      it("should raise error", () => {
        const result = runEffectExit(
          createExpectCTHeaderValue([false as never, {}])
        );
        expect(Exit.isFailure(result)).toBe(true);
      });
    });

    describe("giving true in the first element", () => {
      it('should return "max-age" set one day', async () => {
        expect(await runEffect(createExpectCTHeaderValue([true, {}]))).toBe(
          `max-age=${secondsOfOneDay}`
        );
      });
    });
  });

  describe('when specifying "maxAge" option', () => {
    describe("the number is valid", () => {
      it('should return "max-age" set the number', async () => {
        const dummyAge = 123;
        expect(
          await runEffect(createExpectCTHeaderValue([true, { maxAge: dummyAge }]))
        ).toBe(`max-age=${dummyAge}`);
      });
    });

    describe("the number is invalid", () => {
      it("should raise error", () => {
        expect(
          Exit.isFailure(
            runEffectExit(createExpectCTHeaderValue([true, { maxAge: Number.NaN }]))
          )
        ).toBe(true);
        expect(
          Exit.isFailure(
            runEffectExit(
              createExpectCTHeaderValue([
                true,
                { maxAge: Number.POSITIVE_INFINITY },
              ])
            )
          )
        ).toBe(true);
      });
    });
  });

  describe('when specifying "enforce" option', () => {
    describe("the option is false", () => {
      it('should return only "max-age"', async () => {
        expect(
          await runEffect(createExpectCTHeaderValue([true, { enforce: false }]))
        ).toBe(`max-age=${secondsOfOneDay}`);
      });
    });

    describe("the option is true", () => {
      it('should return "max-age" and "enforce"', async () => {
        expect(
          await runEffect(createExpectCTHeaderValue([true, { enforce: true }]))
        ).toBe(`max-age=${secondsOfOneDay}, enforce`);
      });
    });
  });

  describe('when specifying "reportURI" option', () => {
    let strictURIEncoderMock: ReturnType<typeof mock<typeof encodeStrictURI>>;
    beforeEach(() => {
      strictURIEncoderMock = mock(encodeStrictURI);
    });

    it("should call the second argument", async () => {
      const uri = "https://example.com/";
      await runEffect(
        createExpectCTHeaderValue([true, { reportURI: uri }], strictURIEncoderMock)
      );

      expect(strictURIEncoderMock).toBeCalledWith(uri);
    });

    it('should return "max-age" and the URI"', async () => {
      const uri = "https://example.com/";
      expect(
        await runEffect(createExpectCTHeaderValue([true, { reportURI: uri }]))
      ).toBe(`max-age=${secondsOfOneDay}, report-uri=${uri}`);
    });
  });

  describe("when specifying all options", () => {
    describe("the options are negative values", () => {
      it('should return only "max-age"', async () => {
        expect(
          await runEffect(createExpectCTHeaderValue([true, { enforce: false }]))
        ).toBe(`max-age=${secondsOfOneDay}`);
      });
    });

    describe("the options are positive values", () => {
      it('should return "max-age" and the options', async () => {
        const dummyAge = 123;
        expect(
          await runEffect(
            createExpectCTHeaderValue([
              true,
              {
                maxAge: dummyAge,
                enforce: true,
                reportURI: "https://example.com",
              },
            ])
          )
        ).toBe(`max-age=${dummyAge}, enforce, report-uri=https://example.com/`);
      });
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(
        Exit.isFailure(runEffectExit(createExpectCTHeaderValue("foo" as never)))
      ).toBe(true);
      expect(
        Exit.isFailure(runEffectExit(createExpectCTHeaderValue([] as never)))
      ).toBe(true);
    });
  });
});