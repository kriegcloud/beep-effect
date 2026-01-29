import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-object-type",
  tag: "do-not-use-object-type",
  shouldMatch: [
    "function foo(obj: Object) {}",
    "const bar: Object = {}",
    "function baz(x: {}) {}",
    "const qux: {} = value",
    "type Foo = Object | string",
    "type Bar = {} & { id: number }",
    "interface Props { data: Object }",
    "const arr: Object[] = []",
    "function foo(x: Object);",
    "const handler = (obj: Object) =>",
    "type Data = {} | string",
  ],
  shouldNotMatch: [
    "const obj = {}",
    "return {}",
    "interface User { id: number; name: string }",
    "const data: Record<string, unknown> = {}",
    "function handle(input: unknown) {}",
    "type Props = { id: number }",
    "const map: Record<string, User> = {}",
    "Schema.Struct({ id: Schema.Number })",
    "const obj: { name: string }",
  ],
})
