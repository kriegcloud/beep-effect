import {
  createFrameGuardHeader,
  createXFrameOptionsHeaderValue,
} from "@beep/build-utils/secure-headers/frame-guard";
import { encodeStrictURI } from "@beep/build-utils/secure-headers/helpers";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
  Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runSyncExit(effect);

describe("createFrameGuardHeader", () => {
  let headerValueCreatorMock: ReturnType<
    typeof mock<typeof createXFrameOptionsHeaderValue>
  >;
  beforeEach(() => {
    headerValueCreatorMock = mock(createXFrameOptionsHeaderValue);
  });

  it("should return Some with X-Frame-Options header when value is provided", async () => {
    const dummyValue = "deny";
    headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

    const result = await runEffect(
      createFrameGuardHeader(undefined, headerValueCreatorMock)
    );

    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value).toEqual({
        name: "X-Frame-Options",
        value: dummyValue,
      });
    }
    expect(headerValueCreatorMock).toBeCalledWith(undefined);
  });

  it("should return None when value creator returns undefined", async () => {
    headerValueCreatorMock.mockReturnValue(Effect.succeed(undefined));

    const result = await runEffect(
      createFrameGuardHeader(false, headerValueCreatorMock)
    );

    expect(Option.isNone(result)).toBe(true);
    expect(headerValueCreatorMock).toBeCalledWith(false);
  });
});

describe("createXFrameOptionsHeaderValue", () => {
  describe("when giving undefined", () => {
    it('should return "deny"', async () => {
      expect(await runEffect(createXFrameOptionsHeaderValue())).toBe("deny");
      expect(await runEffect(createXFrameOptionsHeaderValue(null as never))).toBe(
        "deny"
      );
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(
        await runEffect(createXFrameOptionsHeaderValue(false))
      ).toBeUndefined();
    });
  });

  describe('when giving "deny"', () => {
    it('should return "deny"', async () => {
      expect(await runEffect(createXFrameOptionsHeaderValue("deny"))).toBe(
        "deny"
      );
    });
  });

  describe('when giving "sameorigin"', () => {
    it('should return "sameorigin"', async () => {
      expect(await runEffect(createXFrameOptionsHeaderValue("sameorigin"))).toBe(
        "sameorigin"
      );
    });
  });

  describe('when giving "allow-from" as array', () => {
    let strictURIEncoderMock: ReturnType<typeof mock<typeof encodeStrictURI>>;
    beforeEach(() => {
      strictURIEncoderMock = mock(encodeStrictURI);
    });

    it('should call "encodeStrictURI"', async () => {
      const uri = "https://example.com/";
      await runEffect(
        createXFrameOptionsHeaderValue(
          ["allow-from", { uri }],
          strictURIEncoderMock
        )
      );

      expect(strictURIEncoderMock).toBeCalledWith(uri);
    });

    it('should return "allow-from" and the URI', async () => {
      const uri = "https://example.com/";
      expect(
        await runEffect(createXFrameOptionsHeaderValue(["allow-from", { uri }]))
      ).toBe(`allow-from ${uri}`);
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(
        Exit.isFailure(
          runEffectExit(createXFrameOptionsHeaderValue(true as never))
        )
      ).toBe(true);
      expect(
        Exit.isFailure(
          runEffectExit(createXFrameOptionsHeaderValue("foo" as never))
        )
      ).toBe(true);
      expect(
        Exit.isFailure(
          runEffectExit(createXFrameOptionsHeaderValue([] as never))
        )
      ).toBe(true);
    });
  });
});