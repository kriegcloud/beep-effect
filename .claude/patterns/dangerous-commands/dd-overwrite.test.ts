import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "dd-overwrite",
  decision: "ask",
  shouldMatch: [
    "dd if=/dev/zero of=/dev/sda",
    "dd of=/dev/disk0 if=image.iso",
    "dd bs=4M if=file.img of=/dev/sdb",
  ],
  shouldNotMatch: [
    "dd if=/dev/sda of=backup.img",
    "dd if=input.txt of=output.txt",
  ],
})
