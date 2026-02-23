import { encodeStrictURI } from "@beep/build-utils/secure-headers/helpers";
import {
  createXSSProtectionHeader,
  createXXSSProtectionHeaderValue,
} from "@beep/build-utils/secure-headers/xss-protection";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runSyncExit(effect);

describe("createXSSProtectionHeader", () => {
  let headerValueCreatorMock: ReturnType<typeof mock<typeof createXXSSProtectionHeaderValue>>;
  beforeEach(() => {
    headerValueCreatorMock = mock(createXXSSProtectionHeaderValue);
  });

  it("should return Some with X-XSS-Protection header when value is provided", async () => {
    const dummyValue = "1";
    headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

    const result = await runEffect(createXSSProtectionHeader(undefined, headerValueCreatorMock));

    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value).toEqual({
        name: "X-XSS-Protection",
        value: dummyValue,
      });
    }
    expect(headerValueCreatorMock).toBeCalledWith(undefined);
  });
});

describe("createXXSSProtectionHeaderValue", () => {
  describe("when giving undefined", () => {
    it('should return "1"', async () => {
      expect(await runEffect(createXXSSProtectionHeaderValue())).toBe("1");
      expect(await runEffect(createXXSSProtectionHeaderValue(null as never))).toBe("1");
    });
  });

  describe("when giving false", () => {
    it('should return "0"', async () => {
      expect(await runEffect(createXXSSProtectionHeaderValue(false))).toBe("0");
    });
  });

  describe('when giving "sanitize"', () => {
    it('should return "1"', async () => {
      expect(await runEffect(createXXSSProtectionHeaderValue("sanitize"))).toBe("1");
    });
  });

  describe('when giving "block-rendering"', () => {
    it('should return "1; mode=block"', async () => {
      expect(await runEffect(createXXSSProtectionHeaderValue("block-rendering"))).toBe("1; mode=block");
    });
  });

  describe('when giving "report" as array', () => {
    let strictURIEncoderMock: ReturnType<typeof mock<typeof encodeStrictURI>>;
    beforeEach(() => {
      strictURIEncoderMock = mock(encodeStrictURI);
    });

    it("should call the second argument", async () => {
      const uri = "https://example.com/";
      await runEffect(createXXSSProtectionHeaderValue(["report", { uri }], strictURIEncoderMock));

      expect(strictURIEncoderMock).toBeCalledWith(uri);
    });

    it('should return "1; report=" and the URI', async () => {
      const uri = "https://example.com/";
      expect(await runEffect(createXXSSProtectionHeaderValue(["report", { uri }]))).toBe(`1; report=${uri}`);
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(Exit.isFailure(runEffectExit(createXXSSProtectionHeaderValue(true as never)))).toBe(true);
      expect(Exit.isFailure(runEffectExit(createXXSSProtectionHeaderValue("foo" as never)))).toBe(true);
      expect(Exit.isFailure(runEffectExit(createXXSSProtectionHeaderValue([] as never)))).toBe(true);
    });
  });
});
