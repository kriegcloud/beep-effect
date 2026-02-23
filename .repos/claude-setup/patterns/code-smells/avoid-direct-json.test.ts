import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-direct-json",
  tag: "prefer-schema-json",
  shouldMatch: [
    "const data = JSON.parse(str)",
    "const text = JSON.stringify(obj)",
    "JSON.parse(response.body)",
    "const output = JSON.stringify(data, null, 2)",
  ],
  shouldNotMatch: [
    "const json = 'some string'",
    "// JSON.parse should not be used",
    "const parseJson = Schema.parseJson",
    "import { parseJson } from 'effect/Schema'",
  ],
})
