import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "force-push",
  decision: "ask",
  shouldMatch: [
    "git push -f",
    "git push --force",
    "git push --force-with-lease",
    "git push origin main -f",
    "git push origin main --force",
    "git push origin feature --force-with-lease",
    "git push -f origin main",
    "git push --force origin main",
    "git push  -f",
    "git  push -f",
    "git push origin HEAD -f",
  ],
  shouldNotMatch: [
    "git push",
    "git push origin main",
    "git push origin feature",
    "git push --set-upstream origin main",
    "git push -u origin main",
    "git pull --force",
    "git fetch --force",
  ],
})
