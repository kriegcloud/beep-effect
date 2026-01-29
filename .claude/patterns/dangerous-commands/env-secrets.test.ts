import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "expose-secrets",
  decision: "ask",
  shouldMatch: [
    "cat .env",
    "cat config.pem",
    "cat private.key",
    "echo .env",
    "printf .env",
    "head .env.local",
    "tail .env.production",
    "less secrets.secret",
    "more credentials.credential",
    "cat /path/to/.env",
    "cat  .env",
  ],
  shouldNotMatch: [
    "cat README.md",
    "cat package.json",
    "echo 'Hello World'",
    "grep API_KEY .env",
    "vim .env",
    "nano .env",
    "cp .env .env.backup",
    "ls -la",
  ],
})
