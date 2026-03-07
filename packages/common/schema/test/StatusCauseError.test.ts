import { makeStatusCauseError, StatusCauseFields, statusCauseInput } from "@beep/schema/StatusCauseError";
import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
import { describe, expect, it } from "@effect/vitest";
import { Option as O } from "effect";
import * as S from "effect/Schema";

class BeepStatusError extends TaggedErrorClass<BeepStatusError>("BeepStatusError")(
  "BeepStatusError",
  StatusCauseFields
) {}

describe("StatusCauseError", () => {
  it("reuses the shared field schema for tagged errors", () => {
    const error = new BeepStatusError({
      message: "boom",
      status: 500,
      cause: O.none(),
    });

    expect(error._tag).toBe("BeepStatusError");
    expect(error.status).toBe(500);
  });

  it("normalizes optional causes when constructing payloads", () => {
    expect(statusCauseInput("boom", 500)).toEqual({
      message: "boom",
      status: 500,
      cause: O.none(),
    });
  });

  it("builds reusable constructors for status/cause tagged errors", () => {
    const toBeepStatusError = makeStatusCauseError(BeepStatusError);
    const error = toBeepStatusError("boom", 500, new Error("kapow"));

    expect(error).toBeInstanceOf(BeepStatusError);
    expect(S.is(BeepStatusError)(error)).toBe(true);
    expect(error.status).toBe(500);
    expect(O.isSome(error.cause)).toBe(true);
  });
});
