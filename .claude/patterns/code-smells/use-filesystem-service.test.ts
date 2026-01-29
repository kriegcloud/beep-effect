import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "use-filesystem-service",
  tag: "use-effect-filesystem",
  shouldMatch: [
    "import fs from 'node:fs'",
    "import * as fs from 'fs'",
    "import { readFile } from 'node:fs'",
    "const fs = require('fs')",
    "require('node:fs')",
  ],
  shouldNotMatch: [
    "import { FileSystem } from '@effect/platform'",
    "yield* FileSystem.readFile(path)",
    "import { readFileString } from '@effect/platform/FileSystem'",
    "import { join } from 'node:path'",
  ],
})
