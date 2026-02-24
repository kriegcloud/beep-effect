import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-direct-tag-checks",
  tag: "use-type-predicates",
  shouldMatch: [
    "if (event._tag === 'FactRecorded')",
    "event._tag === \"QuestionAsked\"",
    "return obj._tag === 'Success'",
    "const isMatch = result._tag === 'Error'",
  ],
  shouldNotMatch: [
    "const _tag = 'FactRecorded'",
    "const tag = obj._tag",
    "console.log(event._tag)",
    "if ($is('FactRecorded')(event))",
  ],
})
