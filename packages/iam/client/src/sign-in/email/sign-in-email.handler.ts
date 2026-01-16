import {createHandler} from "@beep/iam-client/_common";
import {client} from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import {Kit} from "./sign-in-email.c.ts";
import * as Contract from "./sign-in-email.contract.ts";
/**
 * Handler for signing in with email and password.
 *
 * Features:
 * - Automatically encodes payload before sending to Better Auth
 * - Properly checks for Better Auth errors before decoding response
 * - Notifies `$sessionSignal` after successful sign-in
 * - Uses consistent span naming: "sign-in/email/handler"
 */
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

const serLive = Kit.toLayer({
  Email: (payload)=> Effect.gen(function* () {
    const eff = Handler({
      payload
    });
    return yield* eff.pipe(
      Effect.catchAll(Effect.die)
    );
  }),
});

export class Ser extends Effect.Service<Ser>()(
  "Ser",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const kit = yield* Kit;

      return Kit.of({
        Email: Effect.fn(function* (payload) {
          const {result} = yield* kit.handle("Email", payload);
          return result;
        })
      });
    }),
    accessors: true,
  }
) {

}


export const e: Effect.Effect<void, never, Ser> = Effect.gen(function* () {
  const s = yield* Ser;

  const l = {} as unknown as Contract.Payload;

  const r = yield* s.Email(l);

  yield* Effect.log(r);
}).pipe(
  Effect.provide(serLive)
);