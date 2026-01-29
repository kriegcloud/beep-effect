import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "chmod-777",
  decision: "ask",
  shouldMatch: [
    "chmod 777 file.txt",
    "chmod -R 777 /some/dir",
    "chmod -R 777 .",
    "chmod 777 script.sh",
    "chmod  777 file.txt",
    "chmod -R  777 dir",
    "chmod  -R 777 dir",
  ],
  shouldNotMatch: [
    "chmod 755 file.txt",
    "chmod 644 file.txt",
    "chmod +x script.sh",
    "chmod -R 755 /some/dir",
    "chmod u+w file.txt",
    "chmod g+r file.txt",
    "chmod o-w file.txt",
    "chmod 700 private.key",
  ],
})
