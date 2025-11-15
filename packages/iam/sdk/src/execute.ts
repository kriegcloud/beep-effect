import { Contract, ContractKit } from "@beep/contract";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as Random from "effect/Random";
import * as S from "effect/Schema";

export class ListError extends S.TaggedError<ListError>("@beep/ListError")("ListError", {
  message: S.String,
  cause: S.Defect,
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
        cause: new Error("Failed to list items"),
      });
    }
    return A.makeBy(payload.qty, (index) => `${payload.name}:${index}`);
  })
);

const logFn = LogContract.implement((payload) =>
  Effect.gen(function* () {
    const continuation = LogContract.continuation({
      supportsAbort: true,
      metadata: {
        overrides: {
          method: "logFn",
        },
        extra: {
          correlationId: String(payload.value),
        },
      },
      normalizeError: (error, ctx) =>
        new ListError({
          message: `Unexpected logging failure while running ${ctx.metadata.method}`,
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
    });

    const shouldReturnFailure = yield* Random.nextBoolean;
    const shouldDefect = yield* Random.nextBoolean;

    const response = yield* continuation.run(async (handlers) => {
      return await new Promise<{ readonly error: unknown | null }>((resolve, reject) => {
        const timer = setTimeout(() => {
          if (shouldDefect) {
            reject(new Error("log transport defect"));
            return;
          }
          if (shouldReturnFailure) {
            resolve({
              error: new ListError({
                message: "Remote logger rejected the payload",
                cause: new Error("remote logger error"),
              }),
            });
            return;
          }
          resolve({ error: null });
        }, 25);

        handlers.signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            resolve({
              error: new ListError({
                message: "Log continuation aborted",
                cause: new Error("aborted"),
              }),
            });
          },
          { once: true }
        );
      });
    });

    yield* continuation.raiseResult(response);

    const surfaced = yield* continuation.run(async () => response, { surfaceDefect: true });

    if (Either.isLeft(surfaced)) {
      yield* Console.warn(`[log continuation] surfaced failure: ${surfaced.left}`);
    } else {
      yield* Console.log(`[log continuation] surfaced success envelope: ${JSON.stringify(surfaced.right)}`);
    }

    if (payload.value === "fail") {
      return yield* new ListError({ message: "Failed to log payload", cause: new Error("Failed to log payload") });
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

const continuationDemo = Effect.gen(function* () {
  const continuation = ListContract.continuation({
    metadata: {
      overrides: {
        method: "manualListContinuation",
        description: "Demonstrates manual continuation usage",
      },
      extra: {
        scenario: "demo",
      },
    },
    normalizeError: (error) =>
      new ListError({
        message: "Continuation demo normalized an unexpected error",
        cause: error instanceof Error ? error : new Error(String(error)),
      }),
  });

  const asyncResult = yield* continuation.run(
    async () => ({
      error: new ListError({
        message: "Simulated downstream validation failure",
        cause: new Error("downstream validation failed"),
      }),
    }),
    { surfaceDefect: true }
  );

  if (Either.isLeft(asyncResult)) {
    return yield* new ListError({ message: "Failed to list items", cause: asyncResult.left });
  }

  yield* continuation.raiseResult(asyncResult.right);
}).pipe(Effect.catchAll((failure) => Console.warn(`[continuation-demo] ${failure.message}`)));

const program = Effect.gen(function* () {
  yield* continuationDemo;
  const service = yield* MyService;
  const header = `-------- METADATA --------\n`;
  const annotations = Contract.metadata(ListContract);
  yield* Console.log(
    header,
    JSON.stringify(annotations, null, 2),
    `\n`,
    Array.from({ length: header.length })
      .map(() => "-")
      .join(""),
    `\n`
  );

  const titleAnnotation = annotations.title ?? "Unknown Title";
  yield* Console.log(titleAnnotation);

  yield* service.log({
    value: titleAnnotation,
  });
});

BunRuntime.runMain(program.pipe(Effect.provide(MyService.Default)));
