import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "sudo-rm",
  decision: "ask",
  shouldMatch: [
    "sudo rm -rf /some/path",
    "sudo rm file.txt",
    "sudo rm -r node_modules",
    "sudo rm -f test.txt",
    "sudo rm -rf /",
    "sudo rm -Rf /var/log",
    "sudo rm -rRf /tmp/files",
    "sudo rm  -rf /path",
    "sudo  rm -rf /path",
  ],
  shouldNotMatch: [
    "rm -rf /some/path",
    "rm file.txt",
    "sudo mv file.txt dest.txt",
    "sudo cp file.txt dest.txt",
    "sudo rmdir empty_dir",
    "sudo systemctl restart service",
  ],
})
