import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-any",
  tag: "do-not-use-any",
  shouldMatch: [
    "const x = foo as any",
    "value as unknown as Bar",
    "return data as any",
    "const result = (obj as any).property",
    "items as unknown as string[]",
  ],
  shouldNotMatch: [
    "const any = 5",
    "const isAny = true",
    "function hasAnyValue() {}",
    "type AnyValue = string | number",
  ],
})
