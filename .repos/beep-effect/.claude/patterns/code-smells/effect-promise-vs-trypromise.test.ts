import { testPattern } from "../../test/pattern-test-harness.ts"

testPattern({
  name: "effect-promise-vs-trypromise",
  tag: "use-effect-trypromise",
  shouldMatch: [
    "yield* Effect.promise(() => fetch(url))",
    "yield* Effect.promise(() => api.call())",
    "yield* Effect.promise(async () => await promise)",
    "yield* Effect.promise(() => Promise.resolve(data))",
    "const result = yield* Effect.promise(() => asyncFn())",
    "yield* Effect.promise(function() { return fetch() })",
    "yield* Effect.promise(() =>\n      fetchData()\n    )",
    "yield* Effect.promise( () => getData())",
  ],
  shouldNotMatch: [
    "yield* Effect.tryPromise(() => fetch(url))",
    "Effect.promise(() => fetch())",
    "yield* Effect.tryPromise({ try: () => fetch(), catch: e => new Error() })",
    "const promise = Effect.promise",
    "effectPromise(() => fetch())",
    "yield* promise(() => fetch())",
    "yield* Effect.tryPromise({ try: () => api.call(), catch: (e) => new FetchError(e) })",
    "yield* someOtherEffect",
    "const p = yield* getPromise()",
  ],
})
