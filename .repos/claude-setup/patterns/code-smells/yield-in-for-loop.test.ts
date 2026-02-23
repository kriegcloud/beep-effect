import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "yield-in-for-loop",
  tag: "use-foreach",
  shouldMatch: [
    "for (const item of items) { yield* process(item) }",
    "for (let i = 0; i < arr.length; i++) {\n  yield* doSomething(arr[i])\n}",
    "for (const user of users) { yield* sendEmail(user) }",
    "for (const id of ids) { const result = yield* fetchUser(id) }",
  ],
  shouldNotMatch: [
    "Effect.forEach(items, processItem)",
    "yield* Effect.forEach(items, fn)",
    "for (const x of arr) { console.log(x) }",
    "// for loop with yield*",
    "items.forEach(item => process(item))",
  ],
})
