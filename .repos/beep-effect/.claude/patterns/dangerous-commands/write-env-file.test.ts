import { testWritePattern } from "../../test/pattern-test-harness.ts"

testWritePattern({
  name: "write-env-file",
  decision: "ask",
  shouldMatch: [
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    "apps/web/.env",
    "/path/to/.env",
    "config/.env.test",
    ".env.staging",
  ],
  shouldNotMatch: [
    ".env.example",
    ".env.template",
    "config.ts",
    "environment.ts",
    "src/env/config.ts",
    "README.md",
  ],
})
