import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "avoid-fs-promises",
  tag: "wrap-fs-promises",
  shouldMatch: [
    "import fs from 'node:fs/promises'",
    "import { readFile } from 'node:fs/promises'",
    "import fs from 'fs/promises'",
    "import { writeFile, readFile } from 'fs/promises'",
  ],
  shouldNotMatch: [
    "import { FileSystem } from '@effect/platform'",
    "import fs from 'node:fs'",
    "// import from 'fs/promises'",
    "const path = 'fs/promises/file.txt'",
  ],
})
