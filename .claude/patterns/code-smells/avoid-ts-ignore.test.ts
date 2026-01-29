import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-ts-ignore",
  tag: "do-not-silence-types",
  shouldMatch: [
    "// @ts-ignore",
    "// @ts-expect-error",
    "@ts-ignore",
    "@ts-expect-error",
    "// @ts-ignore - legacy code",
    "/* @ts-expect-error */",
  ],
  shouldNotMatch: [
    "const x = 5",
    "Effect.try({ try: () => foo() })",
    "tsconfig.json",
    "typescript",
  ],
})
