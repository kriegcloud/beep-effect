import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-untagged-errors",
  tag: "avoid-untagged-errors",
  shouldMatch: [
    "if (err instanceof Error) { }",
    "instanceof Error",
    "new Error('oops')",
    "new Error()",
    "throw new Error('failed')",
    "} catch (e) {\n  if (e instanceof Error) {\n    return e.message\n  }\n}",
  ],
  shouldNotMatch: [
    "class MyError extends Data.TaggedError('MyError')<{ message: string }> {}",
    "Effect.fail(new MyError({ message: 'oops' }))",
    "instanceof MyCustomError",
    "new ErrorHandler()",
    "Data.TaggedError",
    "const errorCount = 5",
  ],
})
