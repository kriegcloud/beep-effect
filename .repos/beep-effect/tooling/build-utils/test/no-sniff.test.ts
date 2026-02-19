import { createNosniffHeader, createXContentTypeOptionsHeaderValue } from "@beep/build-utils/secure-headers/no-sniff";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runSyncExit(effect);

describe("createNosniffHeader", () => {
  let headerValueCreatorMock: ReturnType<typeof mock<typeof createXContentTypeOptionsHeaderValue>>;
  beforeEach(() => {
    headerValueCreatorMock = mock(createXContentTypeOptionsHeaderValue);
  });

  it("should return Some with X-Content-Type-Options header when value is provided", async () => {
    const dummyValue = "nosniff" as const;
    headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

    const result = await runEffect(createNosniffHeader(undefined, headerValueCreatorMock));

    expect(Option.isSome(result)).toBe(true);
    if (Option.isSome(result)) {
      expect(result.value).toEqual({
        name: "X-Content-Type-Options",
        value: dummyValue,
      });
    }
    expect(headerValueCreatorMock).toBeCalledWith(undefined);
  });

  it("should return None when value creator returns undefined", async () => {
    headerValueCreatorMock.mockReturnValue(Effect.void.pipe(Effect.as(undefined)));

    const result = await runEffect(createNosniffHeader(false, headerValueCreatorMock));

    expect(Option.isNone(result)).toBe(true);
    expect(headerValueCreatorMock).toBeCalledWith(false);
  });
});

describe("createXContentTypeOptionsHeaderValue", () => {
  describe("when giving undefined", () => {
    it('should return "nosniff"', async () => {
      expect(await runEffect(createXContentTypeOptionsHeaderValue())).toBe("nosniff");
      expect(await runEffect(createXContentTypeOptionsHeaderValue(null as never))).toBe("nosniff");
    });
  });

  describe("when giving false", () => {
    it("should return undefined", async () => {
      expect(await runEffect(createXContentTypeOptionsHeaderValue(false))).toBeUndefined();
    });
  });

  describe('when giving "nosniff"', () => {
    it('should return "nosniff"', async () => {
      expect(await runEffect(createXContentTypeOptionsHeaderValue("nosniff"))).toBe("nosniff");
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(Exit.isFailure(runEffectExit(createXContentTypeOptionsHeaderValue(true as never)))).toBe(true);
      expect(Exit.isFailure(runEffectExit(createXContentTypeOptionsHeaderValue("foo" as never)))).toBe(true);
      expect(Exit.isFailure(runEffectExit(createXContentTypeOptionsHeaderValue([] as never)))).toBe(true);
    });
  });
});
