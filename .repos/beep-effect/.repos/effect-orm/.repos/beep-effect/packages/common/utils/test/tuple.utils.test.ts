import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { makeMappedEnum } from "@beep/utils/data/tuple.utils";
import { Effect } from "effect";

effect("makeMappedEnum maps literals to custom enum keys", () =>
  Effect.gen(function* () {
    const { Enum } = makeMappedEnum("beep", "hole")(["beep", "BEEP"], ["hole", "HOLE"]);

    expect(Enum.BEEP).toBe("beep");
    expect(Enum.HOLE).toBe("hole");
  })
);
