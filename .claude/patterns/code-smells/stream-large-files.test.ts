import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "stream-large-files",
  tag: "consider-streaming",
  shouldMatch: [
    "fs.readFile(path)",
    "fs.readFileString(filePath)",
    "fs.readFile (somePath)",
    "await fs.readFileString('/data/large.txt')",
  ],
  shouldNotMatch: [
    "fs.stream(path)",
    "Stream.fromFile(path)",
    "fs.writeFile(path, content)",
    "fs.readDir(path)",
  ],
})
