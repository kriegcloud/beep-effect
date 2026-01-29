import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "hard-reset",
  decision: "ask",
  shouldMatch: [
    "git reset --hard",
    "git reset --hard HEAD",
    "git reset --hard HEAD~1",
    "git reset --hard origin/main",
    "git reset --hard abc123",
    "git reset  --hard",
    "git  reset --hard",
    "git reset --hard HEAD~5",
    "git reset --hard @{u}",
  ],
  shouldNotMatch: [
    "git reset",
    "git reset HEAD",
    "git reset --soft HEAD~1",
    "git reset --mixed HEAD~1",
    "git reset HEAD file.txt",
    "git reset --soft",
    "git reset --mixed",
    "git revert --hard",
  ],
})
