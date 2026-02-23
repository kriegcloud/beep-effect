import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "git-branch-force-delete",
  decision: "ask",
  shouldMatch: [
    "git branch -D feature",
    "git branch -D my-branch",
    "git branch -D feature/new-thing",
    "git branch  -D feature",
    "git  branch -D feature",
    "git branch -D",
  ],
  shouldNotMatch: [
    "git branch --delete --force feature",
    "git branch -d feature",
    "git branch feature",
    "git branch",
    "git branch -a",
    "git branch -r",
    "git branch --list",
    "git checkout -D feature",
  ],
})
