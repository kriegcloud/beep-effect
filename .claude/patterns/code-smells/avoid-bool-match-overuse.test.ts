import { testPattern } from "@beep/claude/test/pattern-test-harness";

testPattern({
  name: "avoid-bool-match-overuse",
  tag: "flatter-bool-control",
  shouldMatch: [
    "Bool.match(flag, { onFalse: () => base, onTrue: () => Bool.match(other, { onFalse: () => mid, onTrue: () => high }) })",
    "return Bool.match(event.shiftKey, {\n  onFalse: () => base,\n  onTrue: () => Bool.match(event.metaKey || event.ctrlKey, {\n    onFalse: () => doubled,\n    onTrue: () => precise,\n  }),\n})",
  ],
  shouldNotMatch: [
    "Bool.match(flag, { onFalse: () => base, onTrue: () => high })",
    "if (flag && other) { return high; }\nreturn base;",
    "O.liftPredicate(predicate)(value)",
  ],
});
