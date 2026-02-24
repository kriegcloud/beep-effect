import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-try-catch",
  tag: "avoid-try-catch",
  shouldMatch: [
    "try { foo() } catch (e) { }",
    "try {",
    "try {\n  const x = riskyOperation()\n} catch (err) {\n  console.error(err)\n}",
    "try{",
    "try  {",
  ],
  shouldNotMatch: [
    "Effect.try({ try: () => foo() })",
    "const retry = 5",
    "tryPromise",
    "Effect.tryPromise",
  ],
})
