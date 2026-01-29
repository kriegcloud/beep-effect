import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-expect-in-if",
  tag: "use-assert-to-narrow",
  glob: "**/*.{test,spec}.{ts,tsx}",
  shouldMatch: [
    "if (value) { expect(value.name).toBe('test') }",
    "if (result.data) { expect(result.data.id).toBe(123) }",
    "if (user) { expect(user.active).toBe(true) }",
    "if (obj?.nested) { expect(obj.nested.prop).toEqual('value') }",
  ],
  shouldNotMatch: [
    "expect(value).toBeDefined()",
    "if (value) { console.log(value) }",
    "const expected = true",
  ],
})
