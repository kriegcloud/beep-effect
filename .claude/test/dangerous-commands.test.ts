import { testBashPattern } from "./pattern-test-harness"

testBashPattern({
  name: "git-clean",
  decision: "ask",
  shouldMatch: [
    "git clean -f",
    "git clean -fd",
    "git clean -fdx",
    "git clean --force",
  ],
  shouldNotMatch: [
    "git clean -n",
    "git clean --dry-run",
  ],
})

testBashPattern({
  name: "git-destroy-history",
  decision: "ask",
  shouldMatch: [
    "git reflog expire --expire=now --all",
    "git reflog expire",
    "git gc --prune=now",
    "git gc --prune=2.weeks.ago",
  ],
  shouldNotMatch: [
    "git reflog",
    "git gc",
  ],
})

testBashPattern({
  name: "git-discard-changes",
  decision: "ask",
  shouldMatch: [
    "git checkout -- .",
    "git checkout --  .",
    "git restore .",
  ],
  shouldNotMatch: [
    "git checkout -- file.txt",
    "git checkout branch-name",
  ],
})
