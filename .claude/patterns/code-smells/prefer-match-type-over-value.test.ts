import { testPattern } from "@beep/claude/test/pattern-test-harness";

testPattern({
  name: "prefer-match-type-over-value",
  tag: "prefer-match-type-over-value",
  shouldMatch: [
    "return Match.value(host).pipe(Match.when('localhost', () => local), Match.orElse(() => remote))",
    "const classify = Match.value(input).pipe(Match.when({ kind: 'a' }, onA), Match.orElse(onOther))",
  ],
  shouldNotMatch: [
    "return Match.type<Host>().pipe(Match.when('localhost', () => local), Match.orElse(() => remote))",
    "return Match.tags({ Local: onLocal, Remote: onRemote })",
    "const value = input",
  ],
});
