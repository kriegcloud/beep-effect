import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "rm-rf",
  decision: "ask",
  shouldMatch: [
    "rm -rf /",
    "rm -rf ~",
    "rm -rf $HOME",
    "rm -rf /home",
    "rm -r /",
    "rm -f /",
    "rm -rf ~/",
    "rm -rf $HOME/",
    "rm -rf /home/",
    "rm -fr /",
    "rm -rf  /",
    "rm  -rf /",
    "rm -r -f /",
  ],
  shouldNotMatch: [
    "rm file.txt",
    "rm -r ./node_modules",
    "rm -rf ./build",
    "rm -rf /tmp/myapp",
    "rm -rf /var/log/myapp",
    "rm -rf node_modules",
    "rm -f test.txt",
    "rm -r dist",
  ],
})
