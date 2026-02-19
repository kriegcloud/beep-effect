
in `packages/common/contract/src/Contract.ts` I am working on a function called `lift` & `FailureMode.$match`. 

Before you continue you are required to review the following files while using the `effect-docs` mcp tool to ensure you understand the `@beep/contract` package and the effect patterns there in.

- packages/common/contract/src/ContractError.ts
- packages/common/contract/src/Contract.ts
- packages/common/contract/src/ContractKit.ts
- packages/common/contract/src/index.ts

When reviewing the above files make sure you pay extra close attention to how the `failureMode` property of a contract effects result of the `.handle`  method on ContractKit. Also Make sure you understand the various Helper Types in `Contract.ts` & `ContractKit.ts` such as `Result`, `Requirements`, `Failure`, `Success` & `ImplementationResult`.


The goal of the `FailureMode.$match` method is to make it easier to match on the `failureMode` property of a `Contract` (will exclusively be used in the `lift` function). The goal of this lift function is to "lift" the Contract definition (`C extends Any`) into an effect which can be used to create an `Effect.Service` method. For example without the lift method creating an `effect` function which satisfies the `ListContract` takes a while and is quite verbose.
```ts
import {Contract, ContractKit} from "@beep/contract";  
import * as BunRuntime from "@effect/platform-bun/BunRuntime";  
import * as Console from "effect/Console";  
import * as Effect from "effect/Effect";  
import * as Layer from "effect/Layer";  
import * as Random from "effect/Random";  
import * as S from "effect/Schema";  
  
export class ListError extends S.TaggedError<ListError>("@beep/ListError")("ListError", {  
  message: S.String,  
}) {  
}  
  
const LogContract = Contract.make("log", {  
  description: "Log the payload.value property to the console",  
  payload: {  
    value: S.Any  
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
  failureMode: "error",  // specifies that the contract's implementation should not return failures as a value and filter out the success channel by yielding `if (contractResult.isFailure) Effect.fail(contractResult.result)` turnging `Effect.Effect<Result<C>, Failure<C>, Requirements<C>>` into `Effect.Effect<Success<C>, Failure<C>, Requirements<C>>`  
})  
  .annotate(Contract.Title, "List")  
  .annotate(Contract.Domain, "Demo")  
  .annotate(Contract.Method, "list");  
  
const MyContractKit = ContractKit.make(ListContract, LogContract);  
  
const listFn = Effect.fn("listFn")(function* (payload: Contract.Payload<typeof ListContract>) {  
  const shouldFail = yield* Random.nextBoolean;  
  const list = Array.from({length: payload.qty}, () => payload.name).map((n, i) => `${n}:${i}`);  
  if (shouldFail) {  
    return yield* new ListError({  
      message: "Failed to list items",  
    });  
  }  
  
  return list;  
});  
  
const logFn = Effect.fn("logFn")(function* (payload: Contract.Payload<typeof LogContract>) {  
   yield* Console.log(String(payload.value));  
});  
  
//  
const Implementations = MyContractKit.of({  
  list: listFn,  
  log: logFn  
});  
  
const layer = MyContractKit.toLayer(Implementations);  
  
export class MyService extends Effect.Service<MyService>()("MyService", {  
  dependencies: [layer],  
  accessors: true,  
  effect: Effect.gen(function* () {  
    const kit = yield* MyContractKit;  
  
    const list = kit.handle("list");  
    const log = kit.handle("log");  
    return {  
      list,  
      log,  
    };  
  }),  
}) {  
  static readonly Live = MyService.Default.pipe(Layer.provide(layer));  
}  
  
const program = Effect.gen(function* () {  
  const myService = yield* MyService;  
  
  const r = yield* myService.list({  
    name: "beep",  
    qty: 10,  
  });  
  yield* myService.log({value: r});  
});  
  
BunRuntime.runMain(program.pipe(Effect.provide(MyService.Default)));
```


The goal of the `Contract.lift` method will be to simplify lifting a Contract Implementation into an `Effect.Service` method only returning `Success<C>` other wise it should fail. I'm having a hard time thinking through the implementation of this `Contract.lift` function and I believe I am over thinking it. Here is what I'm struggling with.

- If the `.failureMode` property of the contract is `"return"` then I'm thinking the `.lift` method would return `Result<C>` which is `Failure<C> | Success<C>` However other errors can occur which could potentially not be specified in the `failureSchema` of the Contract such as `ParseError` | `MalformedOutput` | `MalformedInput` | `UnknownError` etc (see `packages/common/contract/src/ContractError.ts`). Since the goal of the `@beep/contract` package is to stream line the creation of `spec` driven service contracts with explicit errors, successes and payloads I am unsure as to whether or not a `Defect` (an error  which is not specified in the `failureSchema` of a contract) should result in killing the effect via `Effect.die` or if the defect should result in an `Effect.failure` I would like you're input on this.
- Additionally I want to make the `Result<C>` type doubly discriminated based on the failureMode property as well as whether or not the implementation failed. This is so that I can easily use the `effect/Match` module to have a very idiomatic way to handle for each of the cases. for example I could do
```ts
import {Contract, ContractKit} from "@beep/contract";  
import * as BunRuntime from "@effect/platform-bun/BunRuntime";  
import * as Console from "effect/Console";  
import * as Effect from "effect/Effect";  
import * as Layer from "effect/Layer";  
import * as Random from "effect/Random";  
import * as S from "effect/Schema";  
import * as Match from "effect/Match";  
import * as F from "effect/Function";  
  
export class ListError extends S.TaggedError<ListError>("@beep/ListError")("ListError", {  
  message: S.String,  
}) {  
}  
  
const LogContract = Contract.make("log", {  
  description: "Log the payload.value property to the console",  
  payload: {  
    value: S.Any  
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
  failureMode: "error",  // specifies that the contract's implementation should not return failures as a value and filter out the success channel by yielding `if (contractResult.isFailure) Effect.fail(contractResult.result)` turnging `Effect.Effect<Result<C>, Failure<C>, Requirements<C>>` into `Effect.Effect<Success<C>, Failure<C>, Requirements<C>>`  
})  
  .annotate(Contract.Title, "List")  
  .annotate(Contract.Domain, "Demo")  
  .annotate(Contract.Method, "list");  
  
const MyContractKit = ContractKit.make(ListContract, LogContract);  
  
const listFn = Effect.fn("listFn")(function* (payload: Contract.Payload<typeof ListContract>) {  
  const shouldFail = yield* Random.nextBoolean;  
  const list = Array.from({length: payload.qty}, () => payload.name).map((n, i) => `${n}:${i}`);  
  if (shouldFail) {  
    return yield* new ListError({  
      message: "Failed to list items",  
    });  
  }  
  
  return list;  
});  
  
const logFn = Effect.fn("logFn")(function* (payload: Contract.Payload<typeof LogContract>) {  
  yield* Console.log(String(payload.value));  
});  
  
//  
const Implementations = MyContractKit.of({  
  list: listFn,  
  log: logFn  
});  
  
const layer = MyContractKit.toLayer(Implementations);  
  
export class MyService extends Effect.Service<MyService>()("MyService", {  
  dependencies: [layer],  
  accessors: true,  
  effect: Effect.gen(function* () {  
    const kit = yield* MyContractKit;  
  
    const list = kit.handle("list");  
    const log = kit.handle("log");  
    return {  
      list,  
      log,  
    };  
  }),  
}) {  
  static readonly Live = MyService.Default.pipe(Layer.provide(layer));  
}  
  
const failedImplResultErrorMode = {  
  _tag: "failure", // identifies that calling the implementation function failed  
  mode: Contract.FailureMode.Enum.error, // mode property identifying the the contract was configured with `failureMode: "error"` and should return only the result of the implementation even if it succeeded `Success<C>`  
  result: {} as Contract.Failure<typeof ListContract> // the Success<C> of the implementation  
} as const;  
  
const failedImplResultReturnMode = {  
  _tag: "failure", // identifies that calling the implementation function failed  
  mode: Contract.FailureMode.Enum.return, // mode property identifying the the contract was configured with `failureMode: "return"` and should return the result of the implementation even if it failed  
  result: {} as Contract.Failure<typeof ListContract> // the Result<C> (Failure<C> | Success<C>) of the implementation but `Success<C>` should be excluded from the union as `_tag` is equal to `"failure"`  
} as const;  
  
const succeededImplResultReturnMode = {  
  _tag: "success", // identifies that calling the implementation function failed  
  mode: Contract.FailureMode.Enum.return, // mode property identifying the the contract was configured with `failureMode: "return"` and should return the result of the implementation even if it failed  
  result: {} as Contract.Success<typeof ListContract>  // the Result<C> (Failure<C> | Success<C>) of the implementation but `Failure<C>` should be excluded from the union as `_tag` is equal to `"success"`  
} as const;  
  
  
const succeedImplResultReturnErrorMode = {  
  _tag: "success",  
  mode: Contract.FailureMode.Enum.error,  
  result: {} as Contract.Success<typeof ListContract>  
} as const;  
  
const possibleResults = [  
  failedImplResultErrorMode,  
  failedImplResultReturnMode,  
  succeededImplResultReturnMode,  
  succeedImplResultReturnErrorMode  
] as const;  
const program = Effect.gen(function* () {  
  
  const idx = yield* Random.nextIntBetween(0, possibleResults.length - 1);  
  const randomResult = possibleResults[idx]!;  
  
  const handleResult = ({  
                          onFailure,  
                          onSuccess,  
                        }: {  
    readonly onFailure: (failure: Contract.Failure<typeof ListContract>) => Effect.Effect<void, never, never>,  
    readonly onSuccess: (success: Contract.Success<typeof ListContract>) => Effect.Effect<void, never, never>,  
  }) => (implResult: typeof possibleResults[number]) => Match.value(implResult).pipe(  
    Match.discriminatorsExhaustive("mode")({  
      error: (e) => Match.value(e).pipe(  
        Match.tagsExhaustive({  
          failure: (failure) => Effect.flatMap(onFailure(failure.result), () => Effect.fail(failure.result)),  
          success: (success) => Effect.flatMap(onSuccess(success.result), () => Effect.succeed(success)),  
        })  
      ),  
      return: (e) => F.pipe(  
        Match.value(e).pipe(  
          Match.tagsExhaustive({  
            failure: (failure) => onFailure(failure.result),  
            success: (success) => onSuccess(success.result),  
          })  
        ),  
        Effect.flatMap(() => Effect.succeed(e)),  
      ),  
    })  
  );  
  
  
  const myService = yield* MyService;  
  
  const r = yield* myService.list({  
    name: "beep",  
    qty: 10,  
  });  
  
  yield* handleResult({  
    onFailure: (failure) => Effect.logError(failure),  
    onSuccess: (success) => Effect.log(success),  
  })(randomResult);  
  
  yield* myService.log({value: r});  
});  
  
BunRuntime.runMain(program.pipe(Effect.provide(MyService.Default)));
```

The above is just an example of how a discriminated type could be utilized to handle each case.


At the end of the day If you take a look at:
- packages/iam/client/src/clients/passkey-v2/passkey.contracts.ts
- packages/iam/client/src/clients/passkey-v2/passkey.implementations.ts
- packages/iam/client/src/clients/passkey-v2/passkey.service.ts
- packages/iam/client/src/clients/passkey-v2/passkey.atoms.ts
- packages/iam/client/src/clients/passkey-v2/passkey.forms.ts

You can see that In order for me to make use of the `@beep/contract` packages features a lot of boilerplate would be required each time I want to create a system such as this.
What I like for obvious reasons is how typesafe and strict this system is. But it feels repetitive to have to handle the result each time.
```ts
import {
  PasskeyAddContract,
  PasskeyContractKit,
  PasskeyListContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract,
} from "@beep/iam-client/clients/passkey-v2/passkey.contracts";
import { passkeyLayer } from "@beep/iam-client/clients/passkey-v2/passkey.implementations";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class PasskeyService extends Effect.Service<PasskeyService>()(
  "@beep/iam-client/clients/passkey-v2/PasskeyService",
  {
    accessors: true,
    dependencies: [passkeyLayer],
    effect: Effect.gen(function* () {
      const handlers = yield* PasskeyContractKit.liftService();

      return {
        list: () => handlers.PasskeyList({}),
        add: (payload: typeof PasskeyAddContract.payloadSchema.Type) => handlers.PasskeyAdd(payload),
        remove: (payload: typeof PasskeyRemoveContract.payloadSchema.Type) => handlers.PasskeyRemove(payload),
        update: (payload: typeof PasskeyUpdateContract.payloadSchema.Type) => handlers.PasskeyUpdate(payload),
      };
    }),
  }
) {
  static readonly Live = this.Default.pipe(Layer.provide(passkeyLayer));
}

The new tooling collapses the boilerplate:

- `Contract.implement(contract)` wraps each implementation with the right signature, annotations, and optional hooks so `ContractKit.of({ ... })` remains type-safe but concise.
- `PasskeyContractKit.liftService()` (and the underlying `Contract.lift`) return service-ready handlers that already filter out return-mode failures, so the service definition is just plumbing those handlers into `Effect.Service`.
- When you need access to the discriminated results (for logging or telemetry), `ContractKit.liftService({ mode: "result" })` exposes the `HandleOutcome` union, which you can decode with `Contract.handleOutcome(contract)({ onSuccess, onFailure })`.
```

Can you please research and explore ideas around how I might add features/functions the to the `Contract` & `ContractKit` modules such that I can streamline the process of lifting Contract/ContractKit definitions into Effect services. Here is my Ideal syntax:

```ts
import {Contract, ContractKit} from "@beep/contract";  
import * as BunRuntime from "@effect/platform-bun/BunRuntime";  
import * as Console from "effect/Console";  
import * as Effect from "effect/Effect";  
import * as Layer from "effect/Layer";  
import * as Random from "effect/Random";  
import * as S from "effect/Schema";  
import * as Match from "effect/Match";  
import * as F from "effect/Function";
const ListContract = Contract.make("list", {  
  description: "List the payload.name payload.qty times.",  
  payload: {  
    name: S.String,  
    qty: S.NonNegativeInt,  
  },  
  failure: ListError,  
  success: S.Array(S.String),  
  failureMode: "error",  // specifies that the contract's implementation should not return failures as a value and filter out the success channel by yielding `if (contractResult.isFailure) Effect.fail(contractResult.result)` turnging `Effect.Effect<Result<C>, Failure<C>, Requirements<C>>` into `Effect.Effect<Success<C>, Failure<C>, Requirements<C>>`  
})  
  .annotate(Contract.Title, "List")  
  .annotate(Contract.Domain, "Demo")  
  .annotate(Contract.Method, "list");
  
  
const ListContractImpl = Contract.implement(ListContract)((contract, payload) =>   Effect.gen(function* () {
   const shouldFail = yield* Random.nextBoolean;  
const list = Array.from({length: payload.qty}, () => payload.name).map((n, i) => `${n}:${i}`);  
if (shouldFail) {  
  return yield* new ListError({  
    message: "Failed to list items",  
  });  
}  

const MyContractKit = ContractKit.make(ListContract);

const MyLayer = MyContractKit.toLayer(ContractKit.of({
 list: ListContractImpl
}))

export class MyService extends Effect.Service<MyService>()("@beep/MyService", {
 dependencies: [MyLayer],
 accessors: true,
 effect: MyContractKit.liftService(),
}) {
  static readonly Live = MyService.Default.pipe(Layer.provide(MyLayer))
}

// initial type should be Effect.Effect<void, Contract.Failure<typeof ListContract, MyService>
const program = Effect.gen(function* () {
 const {list} = yield* MyService;
 
 // initial type should be Contract.Success<typeof ListContract>
 const result = yield* list({
  name: "beep",
  qty: 10
 })
})

  
yield*  Console.log(result)
}))

BunRuntime.runMain(program.pipe(Effect.provide(MyService.Default)));
```

Ideally we would add a  `implement` function to   `Contract.ts` (Contract.implement) which would satisfy the `ContractKit.of` for the contracts name in the kit. Where the return type of the `implement` would satisfy the requirements of `ContractKit.of({ list })` and a `liftService` to `ContractKit.ts` which would essentially do what's being done in the `passkey.service.ts` example I showed you (filtering out the errors from the result channel):
```ts
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
    const handlers = yield* PasskeyContractKit.liftService();  
    return yield* handlers.PasskeyUpdate(payload);  
  }),
```

I'm unsure as to what should be done about the failure mode property and how that should effect the behavior of implementations returned from `.listService`. Please do some digging and offer me a research document which you should place in `packages/common/contract/lifting-contracts-to-services-research.md` containing your thoughts and findings


I want to attach some additional helpers to the Contract prototype so I can do the following for successSchema, failureSchema and payloadSchema?

1. `ListContract.decodeSuccess` 
	1. equivalent to `S.decode(ListContract.successSchema)`
2. `ListContract.encodeSuccess`
	1. equivalent to `S.encode(ListContract.successSchema)`

3. `ListContract.decodeUnknownSuccess` 
	1. equivalent to `S.decodeUnknown(ListContract.successSchema)`
4. `ListContract.encodeUnknownSuccess`
	1. equivalent to `S.encodeUnknown(ListContract.successSchema)`
5. `ListContract.decodeOption`
	1. equivalent to `S.decodeOption(ListContract.successSchema)`
6. `ListContract.encodeOption`
	1. equivalent to `S.encodeOption(ListContract.successSchema)`
7. 5. `ListContract.decodeUnknownOption`
	1. equivalent to `S.decodeUnknownOption(ListContract.successSchema)`
8. `ListContract.encodeUnknownOption`
	1. equivalent to `S.encodeUnknownOption(ListContract.successSchema)`
9. `ListContract.decodeEither`
	1. equivalent to `S.decodeEither(ListContract.successSchema)`
10. `ListContract.encodeEither
	1. equivalent to `S.encodeEither(ListContract.successSchema)`
11. 5. `ListContract.decodeUnknownEither
	1. equivalent to `S.decodeUnknownEither(ListContract.successSchema)`
12. `ListContract.encodeUnknownEither
	1. equivalent to `S.encodeUnknownEither(ListContract.successSchema)`
13. `ListContract.isSuccess`
	1. equivalent to `S.is(ListContract.successSchema)`