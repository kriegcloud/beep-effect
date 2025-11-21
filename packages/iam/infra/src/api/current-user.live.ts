import { Api } from "@beep/iam-infra/api/root";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

export const CurrentUserLive = HttpApiBuilder.group(
  Api,
  "currentUser",
  Effect.fnUntraced(function* (handlers) {
    return handlers.handle("get", () =>
      Effect.gen(function* () {
        const current = yield* AuthContext;

        yield* Console.log("current: ", JSON.stringify(current, null, 2));
        return current.user;
      })
    );
  })
);
