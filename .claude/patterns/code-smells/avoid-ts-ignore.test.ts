import { testPattern } from "@beep/claude/test/pattern-test-harness";

testPattern({
  name: "avoid-ts-morph-ignore",
  tag: "do-not-silence-types",
  shouldMatch: [
    "// @ts-morph-ignore",
    "// @ts-morph-expect-error",
    "@ts-morph-ignore",
    "@ts-morph-expect-error",
    "// @ts-morph-ignore - legacy code",
    "/* @ts-morph-expect-error */",
  ],
  shouldNotMatch: ["const x = 5", "Effect.try({ try: () => foo() })", "tsconfig.json", "typescript"],
});
