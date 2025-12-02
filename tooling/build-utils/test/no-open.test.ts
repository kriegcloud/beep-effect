import {
  createNoopenHeader,
  createXDownloadOptionsHeaderValue,
} from "@beep/build-utils/secure-headers/no-open";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
  Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runSyncExit(effect);

describe("createNoopenHeader", () => {
  let headerValueCreatorMock: ReturnType<
    typeof mock<typeof createXDownloadOptionsHeaderValue>
  >;
  beforeEach(() => {
    headerValueCreatorMock = mock(createXDownloadOptionsHeaderValue);
  });

  it("should return Some with X-Download-Options header when value is provided", async () => {
    const dummyValue = "noopen" as const;
    headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

    const result = await runEffect(
      createNoopenHeader(undefined, headerValueCreatorMock)
    );

    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value).toEqual({ name: "X-Download-Options", value: dummyValue });
    }
    expect(headerValueCreatorMock).toBeCalledWith(undefined);
  });

  it("should return None when value creator returns undefined", async () => {
    headerValueCreatorMock.mockReturnValue(Effect.succeed(undefined));

    const result = await runEffect(
      createNoopenHeader(false, headerValueCreatorMock)
    );

    expect(Option.isNone(result)).toBe(true);
    expect(headerValueCreatorMock).toBeCalledWith(false);
  });
});

describe("createXDownloadOptionsHeaderValue", () => {
  describe("when giving undefined", () => {
    it('should return "noopen"', async () => {
      expect(await runEffect(createXDownloadOptionsHeaderValue())).toBe(
        "noopen"
      );
      expect(
        await runEffect(createXDownloadOptionsHeaderValue(undefined))
      ).toBe("noopen");
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(
        await runEffect(createXDownloadOptionsHeaderValue(false))
      ).toBeUndefined();
    });
  });

  describe('when giving "noopen"', () => {
    it('should return "noopen"', async () => {
      expect(await runEffect(createXDownloadOptionsHeaderValue("noopen"))).toBe(
        "noopen"
      );
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(
        Exit.isFailure(
          runEffectExit(createXDownloadOptionsHeaderValue(true as never))
        )
      ).toBe(true);
      expect(
        Exit.isFailure(
          runEffectExit(createXDownloadOptionsHeaderValue("foo" as never))
        )
      ).toBe(true);
      expect(
        Exit.isFailure(
          runEffectExit(createXDownloadOptionsHeaderValue([] as never))
        )
      ).toBe(true);
    });
  });
});