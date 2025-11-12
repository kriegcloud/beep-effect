import { Contract, ContractKit } from "@beep/contract";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Random from "effect/Random";
import * as S from "effect/Schema";
import {getAnnotation} from "@beep/contract/Contract";
export class ListError extends S.TaggedError<ListError>("@beep/ListError")("ListError", {
  message: S.String,
}) {}

const LogContract = Contract.make("log", {
  description: "Log the payload.value property to the console",
  payload: {
    value: S.Any,
  },
  failure: ListError,
  success: S.Void,
  failureMode: "return",
})
  .annotate(Contract.Title, "Log")
  .annotate(Contract.Domain, "Demo")
  .annotate(Contract.Method, "logValue");
const ListContract = Contract.make("list", {
  description: "List the payload.name payload.qty times.",
  payload: {
    name: S.String,
    qty: S.NonNegativeInt,
  },
  failure: ListError,
  success: S.Array(S.String),
  failureMode: "error", // specifies that the contract's implementation should not return failures as a value and filter out the success channel by yielding `if (contractResult.isFailure) Effect.fail(contractResult.result)` turnging `Effect.Effect<Result<C>, Failure<C>, Requirements<C>>` into `Effect.Effect<Success<C>, Failure<C>, Requirements<C>>`
})
  .annotate(Contract.Title, "List")
  .annotate(Contract.Domain, "Demo")
  .annotate(Contract.Method, "list");

const MyContractKit = ContractKit.make(ListContract, LogContract);

const listFn = ListContract.implement((payload) =>
  Effect.gen(function* () {
    const shouldFail = yield* Random.nextBoolean;
    if (shouldFail || payload.name === "fail") {
      return yield* new ListError({
        message: `Failed to list items for ${payload.name}`,
      });
    }
    return A.makeBy(payload.qty, (index) => `${payload.name}:${index}`);
  })
);

const logFn = LogContract.implement((payload) =>
  Effect.gen(function* () {
    if (payload.value === "fail") {
      return yield* new ListError({ message: "Failed to log payload" });
    }
    yield* Console.log(String(payload.value));
  })
);

//
const Implementations = MyContractKit.of({
  list: listFn,
  log: logFn,
});

const layer = MyContractKit.toLayer(Implementations);

export class MyService extends Effect.Service<MyService>()("MyService", {
  dependencies: [layer],
  accessors: true,
  effect: Effect.gen(function* () {
    const baseHandlers = yield* MyContractKit.liftService({
      hooks: {
        onSuccess: ({ name }) => Effect.log(`${String(name)} completed successfully`),
        onFailure: ({ name, failure }) => Effect.logWarning(`${String(name)} failed: ${failure.message}`),
        onDefect: ({ name, cause }) =>
          Effect.logError(`Defect while executing ${String(name)}: ${Cause.pretty(cause)}`),
      },
    });
    const resultHandlers = yield* MyContractKit.liftService({ mode: "result" });
    return {
      list: baseHandlers.list,
      log: baseHandlers.log,
      listWithOutcome: resultHandlers.list,
      logWithOutcome: resultHandlers.log,
    };
  }),
}) {
  static readonly Live = MyService.Default.pipe(Layer.provide(layer));
}

export const handleListOutcome = Contract.handleOutcome(ListContract)({
  onSuccess: (success) =>
    Console.log(
      `[failureMode=${success.mode}] Listed ${success.result.length} items -> encoded: ${JSON.stringify(
        success.encodedResult
      )}`
    ),
  onFailure: (failure) =>
    Console.warn(
      `[failureMode=${failure.mode}] Failure encountered: ${failure.result.message} (encoded: ${JSON.stringify(
        failure.encodedResult
      )})`
    ),
});

export const handleLogOutcome = Contract.handleOutcome(LogContract)({
  onSuccess: (success) => Console.log(`[log success] encoded result: ${JSON.stringify(success.encodedResult)}`),
  onFailure: (failure) =>
    Console.warn(`[log failure] ${failure.result.message} (encoded: ${JSON.stringify(failure.encodedResult)})`),
});

const program = Effect.gen(function* () {
  // const { list, log, listWithOutcome, logWithOutcome } = yield* MyService;
  //
  // const deterministicList = yield* list({
  //   name: "beep",
  //   qty: 5,
  // });
  //
  // yield* Console.log(`deterministicList: ${JSON.stringify(deterministicList)}`);
  // yield* log({ value: deterministicList });
  //
  // yield* Effect.matchEffect(list({ name: "fail", qty: 2 }), {
  //   onFailure: (failure) => Console.warn(`Expected list failure: ${failure.message}`),
  //   onSuccess: (success) => Console.log(`Unexpected success: ${JSON.stringify(success)}`),
  // });
  const header = `-------- ANNOTATIONS --------\n`
  const annotations = yield* Contract.getAnnotations(ListContract.annotations)
  yield* Console.log(header, JSON.stringify(annotations, null, 2), `\n`, Array.from({length: header.length}).map(() => "-").join(""), `\n`)

  // const outcome = yield* listWithOutcome({
  //   name: "boop",
  //   qty: 3,
  // });
  // yield* handleListOutcome(outcome);
  //
  // const logOutcome = yield* logWithOutcome({ value: "fail" });
  // yield* handleLogOutcome(logOutcome);
  const titleAnnotation = yield* getAnnotation(ListContract.annotations)("Title")
  yield* Console.log(
    titleAnnotation
  )
})

BunRuntime.runMain(program.pipe(Effect.provide(MyService.Default)));
