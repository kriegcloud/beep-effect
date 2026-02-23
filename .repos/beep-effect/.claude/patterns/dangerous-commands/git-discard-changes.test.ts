import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "git-discard-changes",
  decision: "ask",
  shouldMatch: [
    "git checkout -- .",
    "git checkout --  .",
    "git checkout --   .",
    "git restore .",
    "git  checkout -- .",
    "git checkout  -- .",
  ],
  shouldNotMatch: [
    "git checkout -- file.txt",
    "git checkout branch-name",
    "git checkout -b new-branch",
    "git checkout main",
    "git restore file.txt",
    "git restore --staged .",
    "git checkout",
  ],
})
