import {Contract, ContractKit} from "@beep/contract";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Random from "effect/Random";

export class ListError extends S.TaggedError<ListError>("@beep/ListError")(
  "ListError",
  {
    message: S.String,
  }
) {
}

const MyListContract = Contract.make("List", {
  description: "List the payload.name",
  payload: {
    name: S.String,
    qty: S.NonNegativeInt,
  },
  failure: ListError,
  success: S.Array(S.String),
  failureMode: "error"
})
  .annotate(Contract.Title, "List")
  .annotate(Contract.Domain, "MyList")
  .annotate(Contract.Method, "List")

const MyContracts = ContractKit.make(
  MyListContract,
);

const listFn = Effect.fn(function* (payload: typeof MyListContract.payloadSchema.Type) {
  const shouldFail = yield* Random.nextBoolean;
  const list = Array.from({length: payload.qty}, () => payload.name).map((n, i) => `${n}:${i}`);
  if (shouldFail) {
    return yield* new ListError({
      message: "Failed to list items",
    });
  }

  return list;
});

const Implementations = MyContracts.of({
  List: listFn
});

const layer = MyContracts.toLayer(Implementations);

export class MyService extends Effect.Service<MyService>()(
  "MyService",
  {
    dependencies: [layer],
    accessors: true,
    effect: Effect.gen(function* () {
      const kit = yield* MyContracts;

      const list = kit.handle("List")

      return {
        list,
      };
    })
  }
) {
  static readonly Live = MyService.Default.pipe(
    Layer.provide(layer)
  );
}

const program = Effect.gen(function* () {

  const myService = yield* MyService;

  const r = yield* myService.list({
    name: "beep",
    qty: 10,
  });
  yield* Console.log(r);
});

BunRuntime.runMain(
  program.pipe(Effect.provide(MyService.Default))
);