import * as B from "@beep/box";
import { describe, expect, it, layer } from "@effect/vitest";
import { Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as Str from "effect/String";

const boxToken = pipe(
  Bun.env.CLOUD_BOX_TOKEN,
  O.fromUndefinedOr,
  O.filter((value) => Str.trim(value).length > 0)
);

pipe(
  boxToken,
  O.match({
    onNone: () =>
      describe("@beep/box live integration (CLOUD_BOX_TOKEN)", () => {
        it("skips live API calls when CLOUD_BOX_TOKEN is absent", () => {
          expect(O.isNone(boxToken)).toBe(true);
        });
      }),
    onSome: () =>
      describe.concurrent("@beep/box live integration", () => {
        layer(B.Box.layer, { timeout: "30 seconds" })((it) => {
          it.effect(
            "reads the authenticated user through the live Box API",
            Effect.fnUntraced(function* () {
              const box = yield* B.Box;
              const response = yield* box.users.getUserMe(B.UsersGetUserMePayload.make({}));

              expect(response).toBeInstanceOf(B.UserFull);
              expect(response.id.length).toBeGreaterThan(0);
            })
          );
        });
      }),
  })
);
