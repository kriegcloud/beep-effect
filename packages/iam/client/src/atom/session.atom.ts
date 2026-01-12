"use client";
import { client } from "@beep/iam-client/adapters";
import { $IamClientId } from "@beep/identity/packages";
import { makeAtomRuntime } from "@beep/runtime-client";
import { Session, User } from "@beep/shared-domain/entities";
import { noOp, thunk } from "@beep/utils";
import { Atom, useAtomValue } from "@effect-atom/atom-react";
import { pipe } from "effect";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

type Action = Data.TaggedEnum<{
  SignOut: {};
  SwitchOrg: {};
  SwitchTeam: {};
  SwitchAccount: {};
}>;

const Action = Data.taggedEnum<Action>();

const $I = $IamClientId.create("atom/session.atom");

class SessionData extends S.Class<SessionData>($I`SessionData`)({
  user: User.Model,
  session: Session.Model,
}) {}

class SessionResponse extends S.Class<SessionResponse>($I`GetSessionResponse`)({
  data: SessionData,
}) {
  static readonly flatMap = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    Effect.flatMap(S.decodeUnknown(SessionResponse.pipe(S.pluck("data"))))(effect);
}

export class SessionService extends Effect.Service<SessionService>()($I`SessionService`, {
  dependencies: [],
  effect: Effect.succeed({
    session: pipe(
      thunk(client.getSession()),
      Effect.tryPromise,
      SessionResponse.flatMap,
      Effect.catchTags({
        UnknownException: Effect.die,
        ParseError: Effect.die,
      })
    ),
    signOut: Effect.succeed("signOut"),
    switchOrg: Effect.succeed("switchOrg"),
    switchTeam: Effect.succeed("switchTeam"),
    switchAccount: Effect.succeed("switchAccount"),
  }),
  accessors: true,
}) {}

const runtime = makeAtomRuntime(SessionService.Default);
const remoteSessionAtom = runtime.atom(SessionService.session);
const sessionAtom = Atom.writable(
  (get: Atom.Context) => get(remoteSessionAtom),
  (_, action: Action) =>
    pipe(
      action,
      Action.$match({
        SignOut: noOp,
        SwitchOrg: noOp,
        SwitchTeam: noOp,
        SwitchAccount: noOp,
      })
    )
);

export const useSession = () => ({
  sessionResult: useAtomValue(sessionAtom),
});
