import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "casting-awareness",
  tag: "type-awareness",
  shouldMatch: [
    "const x = foo as string",
    "return bar as User",
    "data as MyType",
    "value as number",
    "(response as Response)",
  ],
  shouldNotMatch: [
    "const x = foo as const",
    "as const",
    "const colors = ['red', 'blue'] as const",
    "Schema.decode",
    "function isUser(x: unknown): x is User { return true }",
  ],
})
