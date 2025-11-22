import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { deriveKeyEnum } from "@beep/utils/factories/enum.factory";
import * as Effect from "effect/Effect";

effect("deriveKeyEnum builds key-to-key enums", () =>
  Effect.gen(function* () {
    const Enum = deriveKeyEnum({ pending: {}, active: {} });

    expect(Enum).toEqual({ pending: "pending", active: "active" });
  })
);
