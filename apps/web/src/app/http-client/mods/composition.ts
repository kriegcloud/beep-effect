import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
export const divide = (a: number, b: number) =>
  Effect.suspend(() => {
    return Effect.succeed(a / b);
  });

export class EmptyArrayError extends Data.TaggedError("EmptyArrayError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {
    super({
      message,
      cause,
    });
  }
}

export const filterNonEmptyReadonlyArray = <A>(
  values: Array<A>
): Effect.Effect<A.NonEmptyReadonlyArray<A>, EmptyArrayError, never> =>
  F.pipe(
    (values: unknown): values is A.NonEmptyReadonlyArray<A> => A.isArray(values) && A.isNonEmptyReadonlyArray(values),
    (guard) =>
      Effect.suspend(() =>
        guard(values) ? Effect.succeed(values) : Effect.fail(new EmptyArrayError("encountered empty array"))
      )
  );

export const program1 = Effect.promise(() => Promise.reject(new RequestError("encountered request error"))).pipe(
  Effect.sandbox,
  Effect.catchTags({
    // defect from unexpected throws (or Effect.die)
    Die: (die) => Effect.succeed(die.defect),

    // neutral cause meaning "no remaining failure information"; typically the result when fibers were
    // interrupted but their ids weren't preserved, so Cause.pretty reports "All fibers interrupted without errors."
    Empty: (empty) => Effect.succeed(empty),

    // expected failure raised via Effect.fail*; holds the domain error E unchanged.
    Fail: (fail) => Effect.succeed(fail),

    // interruption cause retaining the interrupter FiberId: shows when a fiber is cancelled and the
    // runtime keeps metadata.
    Interrupt: (interrupt) => Effect.succeed(interrupt),

    // composition of two causes that happened concurrently (Promise.all -> Effect.all)
    Parallel: (parallel) => Effect.succeed(parallel),

    // composition of two causes that happened in sequence
    Sequential: (sequential) => Effect.succeed(sequential),
  })
);

export class CustomError extends Data.TaggedError("CustomError")<{
  readonly code: string;
  readonly message: string;
}> {}

const program3 = Effect.gen(function* () {
  yield* Console.log("beep");
  return yield* new CustomError({
    code: "INTERNAL_SERVER_ERROR",
    message: "encountered internal server error",
  });
});

const exit = await Effect.runPromiseExit(program3);

if (exit._tag === "Failure") {
  // const failureOption = Cause.failureOption(exit.cause)
  // const dieOption = Cause.dieOption(exit.cause)
  // const interruptOption = Cause.interruptOption(exit.cause)
  // const failureOption = Cause.squash(exit.cause);
}

// for trpc
export const exit1 = (await Effect.runPromiseExit(program3)).pipe(
  Exit.match({
    onSuccess: F.identity,
    onFailure: (cause) => {
      throw cause.pipe(Cause.squash);
    },
  })
);

class RequestError extends Data.TaggedError("RequestError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {
    super({
      message,
      cause,
    });
  }
}

class ResponseError extends Data.TaggedError("ResponseError")<{
  readonly message: string;
  readonly status?: number;
  readonly cause?: unknown;
}> {}

const effectfulFetch = Effect.fn(function* (url: string) {
  const response = yield* Effect.tryPromise({
    try: () => fetch(url),
    catch: (error) => new RequestError("encountered request error", error),
  });

  if (!response.ok) {
    return yield* new ResponseError({
      message: "encountered response error",
      status: response.status,
      cause: response,
    });
  }

  return response;
});

export const program2 = Effect.gen(function* () {
  const response = yield* effectfulFetch("https://jsonplaceholder.typicode.com/todos/1");

  const json: unknown = yield* Effect.tryPromise({
    try: () => response.json(),
    catch: (error) => new RequestError("encountered response error", error),
  });
  return json;
}).pipe(
  // Effect.timeoutOption("5 seconds"),
  // Effect.timeoutFail({
  // duration: "5 seconds,
  // onTimeout: () => new ResponseError("encountered timeout error", error)
  // ),
  Effect.timeout("5 seconds"),
  Effect.retry({
    times: 3,
    while: (error) =>
      Match.value(error).pipe(
        Match.tags({
          RequestError: () => true,
          TimeoutException: () => true,
        }),
        Match.whenAnd(
          (e) => e._tag === "ResponseError",
          (e) => e.status === 500,
          () => true
        ),
        Match.orElse(() => false)
      ),
    schedule: Schedule.exponential("500 millis", 2),
  }),
  // don't leak error. if (application code)
  Effect.orDie
);

export const InsertModel = S.Struct({
  name: S.optionalWith(S.String, {}),
  age: S.optionalWith(S.Number, {}),
});
export type InsertModel = typeof InsertModel.Type;

export const OutputModel = InsertModel.pipe(
  S.compose(
    S.Struct(
      Struct.evolve(InsertModel.fields, {
        name: () => S.String,
      })
    )
  ),
  S.asSchema
);

export const X = S.parseJson().pipe(
  S.compose(
    S.Struct({
      name: S.String,
      age: S.Number,
    })
  ),
  S.asSchema
);

// const Todo = S.Struct({
//   title: S.String,
//   completed: S.Boolean,
//   created_at: S.DateFromString,
// }).pipe((self) =>
// S.transform(
//   self,
//   S.typeSchema(S.Struct({
//     title: self.fields.title,
//     completed: self.fields.completed,
//     createdAt: self.fields.created_at,
//   })),
//   {
//     strict: true,
//     decode: (fromA) => ({
//       ...fromA,
//       createdAt: fromA.created_at
//     }),
//     encode: (toI) => ({
//       ...toI,
//       created_at: toI.createdAt
//     })
//   }
// ))

const Todo = S.Struct({
  title: S.String,
  completed: S.Boolean,
  created_at: S.DateFromString,
}).pipe(
  S.rename({
    created_at: "createdAt",
  }),
  S.asSchema
);

export const ApiResponse = S.Struct({
  items: S.Array(Todo),
}).pipe(S.pluck("items"), S.asSchema);
