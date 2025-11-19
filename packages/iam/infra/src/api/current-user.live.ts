// import {CurrentUserNotFound} from "@beep/iam-domain/api/User.contract";
// import {UserRepo} from "@beep/iam-infra";
import { Api } from "@beep/iam-infra/api/root";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
// import {SharedEntityIds} from "@beep/shared-domain";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
// import * as O from "effect/Option";
// import * as Cause from "effect/Cause";
// import * as Redacted from "effect/Redacted";
//
// import * as DateTime from "effect/DateTime";
// import * as S from "effect/Schema";
// import {User} from "@beep/shared-domain/entities";
// import * as Either from "effect/Either";

export const CurrentUserLive = HttpApiBuilder.group(
  Api,
  "currentUser",
  Effect.fnUntraced(function* (handlers) {
    // const userRepo = yield* UserRepo;

    return handlers.handle("get", () =>
      Effect.gen(function* () {
        const current = yield* AuthContext;

        yield* Console.log("current: ", JSON.stringify(current, null, 2));
        return current.user;
      })
    );
  })
);
