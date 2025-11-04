import type { Contract } from "@beep/contract";
import * as Effect from "effect/Effect";
import type { IamError } from "../../errors";
import { type FailureContinuation, makeFailureContinuation } from "./failure-continuation";

type HandlerOptions<C extends Contract.Any> = {
  readonly contract: C;
  readonly metadata: () => {
    readonly plugin: string;
    readonly method: string;
  };
  readonly effect: (
    payload: Contract.Payload<C>,
    continuation: FailureContinuation
  ) => Effect.Effect<Contract.Success<C>, IamError, never>;
};
export const make = <const C extends Contract.Any>(params: HandlerOptions<C>) => {
  const { metadata, contract, effect } = params; // (payload: Contract.Payload<C>) =>
  const continuation = makeFailureContinuation({
    contract: contract.name,
    metadata,
  });

  return (payload: Contract.Payload<C>): Effect.Effect<Contract.Success<C>, IamError, never> =>
    effect(payload, continuation).pipe(
      Effect.tapError(Effect.logError),
      Effect.withSpan(`${contract.name}Handler`, {
        attributes: {
          contract: contract.name,
          payload,
          metadata: metadata(),
        },
      }),
      Effect.annotateLogs({
        arguments: payload,
        contract: contract.name,
        metadata: metadata(),
      })
    );
};

// const MyContract = Contract.make("MyContract", {
//   success: S.String,
//   payload: {
//     name: S.String,
//   },
//   failure: S.instanceOf(IamError)
// });
//
// const MyContractKit = ContractKit.make(
//   MyContract,
// );
// const h = makeHandler({
//   contract: MyContract,
//   method: "m",
//   plugin: "l",
//   effect: (continuation)  => (payload) => Effect.gen(function* () {
//     const fn = async () => payload.name;
//     const r = yield* continuation.run((handlers) => fn());
//     return r;
//   })
// });
