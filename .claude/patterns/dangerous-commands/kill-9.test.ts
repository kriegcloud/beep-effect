import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "kill-signal-9",
  decision: "ask",
  shouldMatch: [
    "kill -9 1234",
    "kill -9 5678",
    "kill --signal 9 1234",
    "kill -s 9 1234",
    "kill SIGKILL 1234",
    "kill -KILL 1234",
    "kill -9 $(pgrep node)",
    "kill  -9  1234",
  ],
  shouldNotMatch: [
    "kill 1234",
    "kill -15 1234",
    "kill -TERM 1234",
    "pkill node",
    "killall chrome",
    "kill -HUP 1234",
    "kill -INT 1234",
  ],
})
