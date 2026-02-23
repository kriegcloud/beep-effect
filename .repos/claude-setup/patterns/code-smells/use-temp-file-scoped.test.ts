import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "use-temp-file-scoped",
  tag: "use-scoped-temp",
  shouldMatch: [
    "import os from 'os'",
    "import * as os from 'os'",
    "require('os')",
    "os.tmpdir()",
    ".makeTempFile(",
    ".makeTempDirectory(",
    "const tmpFile = yield* FileSystem.makeTempFile()",
  ],
  shouldNotMatch: [
    "makeTempFileScoped",
    "makeTempDirectoryScoped",
    "yield* FileSystem.makeTempFileScoped()",
    "const osName = 'linux'",
    "const temp = createTempFileScoped()",
  ],
})
