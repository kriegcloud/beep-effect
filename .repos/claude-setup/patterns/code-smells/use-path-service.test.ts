import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "use-path-service",
  tag: "use-effect-path",
  shouldMatch: [
    "import path from 'node:path'",
    "import * as path from 'path'",
    "import { join } from 'node:path'",
    "import { dirname, basename } from 'path'",
  ],
  shouldNotMatch: [
    "import { Path } from '@effect/platform'",
    "yield* Path.join(dir, file)",
    "import { join } from '@effect/platform/Path'",
    "const filePath = '/some/path'",
    "import fs from 'node:fs'",
  ],
})
