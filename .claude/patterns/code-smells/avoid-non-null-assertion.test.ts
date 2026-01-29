import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-non-null-assertion",
  tag: "do-not-assert-non-null",
  shouldMatch: [
    'const value = map.get("key")!;',
    'const value = map.get("key")!.toString()',
    "user!.name",
    "items[0]!.id",
    "getValue()!;",
    "getValue()!.prop",
    "obj.prop!.nested",
    "arr[idx]!(",
    "arr[idx]![key]",
    "result!;",
    "result!['field']",
  ],
  shouldNotMatch: [
    'const value = Option.fromNullable(map.get("key"))',
    "user?.name",
    "user?.contact?.email ?? defaultEmail",
    "const email = user?.email || 'none'",
    "if (user) { return user.name }",
    "// not! a non-null assertion",
    "value !== null",
    "!value",
    "!isValid",
    "const notBang = 'test'",
    'map.get("key")!',
    "result!)",
  ],
})
