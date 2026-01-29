import { testPattern } from "../../test/pattern-test-harness.ts"

testPattern({
  name: "prefer-option-over-null",
  tag: "effect-patterns",
  shouldMatch: [
    "type User = { name: string } | null",
    "const result: string | null = getValue()",
    "null | undefined",
    "function find(): Item | null",
    ": Data | null",
    "null | string",
    "undefined | null",
    "const getUser: (id: string) => User | null",
    "interface Result { data: string | null }",
    "type MaybeValue = null | string",
  ],
  shouldNotMatch: [
    "type User = Option<{ name: string }>",
    "const result: Option<string> = Option.fromNullable(getValue())",
    "Option.none()",
    "if (value === null)",
    "const nullable = null",
    "return null",
    "null ?? defaultValue",
    "const getUser: (id: string) => Option<User>",
    "Option.fromNullable(value)",
    "const value = null",
    "function test(x = null) {}",
  ],
})
