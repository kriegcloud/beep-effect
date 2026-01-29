import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "git-stash-destroy",
  decision: "ask",
  shouldMatch: [
    "git stash drop",
    "git stash drop stash@{0}",
    "git stash drop stash@{1}",
    "git stash clear",
    "git  stash drop",
    "git stash  drop",
    "git  stash  clear",
  ],
  shouldNotMatch: [
    "git stash",
    "git stash pop",
    "git stash list",
    "git stash show",
    "git stash apply",
    "git stash push",
    "git stash save",
    "git stash branch new-branch",
  ],
})
