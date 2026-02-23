import { testPattern } from "../../test/pattern-test-harness"

testPattern({
  name: "use-console-service",
  tag: "use-effect-console",
  shouldMatch: [
    "console.log('hello')",
    "console.error(err)",
    "console.warn('warning')",
    "console.info('info')",
    "console.debug('debug')",
    "console.trace()",
  ],
  shouldNotMatch: [
    "Console.log('hello')",
    "Effect.log('hello')",
    "Effect.logError(err)",
    "yield* Console.error('error')",
    "const console = mockConsole",
  ],
})
