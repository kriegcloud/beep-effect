import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "use-clock-service",
  tag: "use-effect-clock",
  shouldMatch: [
    "new Date()",
    "Date.now()",
    "Date.parse('2024-01-01')",
    "const timestamp = Date.now()",
    "new Date('2024-01-01')",
  ],
  shouldNotMatch: [
    "Clock.currentTimeMillis",
    "DateTime.now",
    "yield* Clock.currentTimeMillis",
    "const date = '2024-01-01'",
  ],
})
