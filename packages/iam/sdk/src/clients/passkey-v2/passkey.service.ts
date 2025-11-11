import {
  PasskeyAddContract,
  PasskeyContractKit,
  PasskeyListContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract,
} from "@beep/iam-sdk/clients/passkey-v2/passkey.contracts";
import { passkeyLayer } from "@beep/iam-sdk/clients/passkey-v2/passkey.implementations";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

export class PasskeyService extends Effect.Service<PasskeyService>()(
  "@beep/iam-sdk/clients/passkey-v2/PasskeyService",
  {
    accessors: true,
    dependencies: [passkeyLayer],
    effect: Effect.gen(function* () {
      const { handle } = yield* PasskeyContractKit;

      return {
        list: () =>
          Effect.gen(function* () {
            const response = yield* handle("PasskeyList")({});

            if (S.is(PasskeyListContract.successSchema)(response.result)) {
              return response.result;
            }

            return yield* Effect.fail(response.result);
          }),
        add: (payload: typeof PasskeyAddContract.payloadSchema.Type) =>
          Effect.gen(function* () {
            const response = yield* handle("PasskeyAdd")(payload);

            if (S.is(PasskeyAddContract.successSchema)(response.result)) {
              return response.result;
            }
            return yield* Effect.fail(response.result);
          }),
        remove: (payload: typeof PasskeyRemoveContract.payloadSchema.Type) =>
          Effect.gen(function* () {
            const response = yield* handle("PasskeyRemove")(payload);

            if (S.is(PasskeyRemoveContract.successSchema)(response.result)) {
              return response.result;
            }
            return yield* Effect.fail(response.result);
          }),
        update: (payload: typeof PasskeyUpdateContract.payloadSchema.Type) =>
          Effect.gen(function* () {
            const response = yield* handle("PasskeyUpdate")(payload);

            if (S.is(PasskeyUpdateContract.successSchema)(response.result)) {
              return response.result;
            }
            return yield* Effect.fail(response.result);
          }),
      };
    }),
  }
) {
  static readonly Live = this.Default.pipe(Layer.provide(passkeyLayer));
}
