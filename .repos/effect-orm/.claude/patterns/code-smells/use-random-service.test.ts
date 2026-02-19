import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "use-random-service",
  tag: "use-effect-random",
  shouldMatch: [
    "Math.random()",
    "const rand = Math.random()",
    "Math.floor(Math.random() * 100)",
    "const value = Math.random()",
    "if (Math.random() > 0.5) { doSomething() }",
  ],
  shouldNotMatch: [
    "Random.next",
    "Random.nextInt",
    "Random.nextIntBetween(0, 100)",
    "const randomService = Random",
    "yield* Random.nextRange(1, 100)",
  ],
})
