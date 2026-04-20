import { testPattern } from "@beep/claude/test/pattern-test-harness";

testPattern({
  name: "review-option-match-flat-control",
  tag: "review-option-match-flat-control",
  shouldMatch: [
    "return O.match(user, { onNone: () => anonymous, onSome: (value) => value.name })",
    "const result = Option.match(option, { onNone: fallback, onSome: project })",
  ],
  shouldNotMatch: [
    "return pipe(user, O.map((value) => value.name), O.getOrElse(() => anonymous))",
    "return pipe(value, O.liftPredicate(predicate), O.getOrElse(() => fallback))",
    "const matchResult = unrelated.match(value)",
  ],
});
