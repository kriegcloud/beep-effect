## test-writer: Testing Guidance Template

> Insert this template into AGENT_PROMPTS.md when delegating test writing tasks.

---

### Standard Test Writing Prompt

```
Create tests for [MODULE_NAME].

Target: [TEST_FILE_PATH]

Test coverage required:
[LIST TEST SCENARIOS]

CRITICAL Testing Patterns (from specs/_guide/patterns/effect-testing-standards.md):

1. Test Bodies - Use Effect.fn(function* () {...})
   - REQUIRED: effect("test name", Effect.fn(function* () {...}))
   - FORBIDDEN: effect("test name", () => Effect.gen(function* () {...}))

2. Callbacks - Add explicit type annotations
   - REQUIRED: A.findFirst(items, (item: ItemType) => item.isValid)
   - FORBIDDEN: A.findFirst(items, (item) => item.isValid)  // item: unknown

3. Layer Composition - Use layer() utility for shared layers
   - REQUIRED: layer(TestLayer)("suite", (it) => { it.effect(...) })
   - FORBIDDEN: effect("test", () => Effect.gen(...).pipe(Effect.provide(TestLayer)))

4. Effect Callbacks - Use Effect.fn for operations requiring yield*
   - REQUIRED: Effect.fn(function* (item: ItemType) { yield* ... })
   - FORBIDDEN: (item) => Effect.gen(function* () { yield* ... })

5. Time-Dependent Tests - Use TestClock
   - Fork → Adjust → Join pattern for delays
   - yield* TestClock.adjust(Duration.seconds(5))

Example patterns:

// Unit test
effect("validates input", Effect.fn(function* () {
  const result = yield* validateInput("test")
  strictEqual(result, expected)
}))

// Integration test with shared layer
const TestLayer = Layer.mergeAll(DbLive, ServiceLive)

layer(TestLayer, { timeout: Duration.seconds(60) })("integration", (it) => {
  it.effect("queries data", Effect.fn(function* () {
    const repo = yield* UserRepo
    const result = yield* repo.findAll()
    strictEqual(result.length, 0)
  }))
})

// Array operations with type annotations
const found = yield* A.findFirst(
  items,
  (item: ItemType) => item.isValid
)

// Effect callbacks with Effect.fn
const processed = yield* A.filterEffect(
  items,
  Effect.fn(function* (item: ItemType) {
    const isValid = yield* validateItem(item)
    return isValid
  })
)

Verification:
bun run test --filter @beep/[PACKAGE_NAME]
bun run check --filter @beep/[PACKAGE_NAME]
```

---

### Customization Guide

Replace the following placeholders:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `[MODULE_NAME]` | Module being tested | `UserService`, `AnswerSchemas`, `CitationValidator` |
| `[TEST_FILE_PATH]` | Path to test file | `packages/iam/server/test/services/UserService.test.ts` |
| `[LIST TEST SCENARIOS]` | Specific test scenarios | `1. Creates user\n2. Validates email\n3. Handles duplicate error` |
| `[PACKAGE_NAME]` | Package name | `iam-server`, `knowledge-server` |

---

### When to Add Additional Context

Add these sections when applicable:

#### For Schema Tests

```
Schema validation patterns:
- Use S.decodeUnknownEither to test validation failures
- Test edge cases: empty arrays, boundary values (0.0, 1.0)
- Test optional fields with undefined and omitted
```

#### For Service Tests

```
Service mocking patterns:
- Mock dependencies with Layer.succeed
- Use Effect.all with concurrency for parallel operations
- Test error handling with Effect.either or Effect.exit
```

#### For Integration Tests

```
Integration test patterns:
- Use layer() utility with appropriate timeout (30-60 seconds)
- Clean up test data in finalizers
- Test transaction rollback on failure
```

#### For Time-Dependent Tests

```
TestClock patterns:
- Fork operation, advance clock, join fiber
- yield* TestClock.adjust(Duration.seconds(N))
- Use Effect.yieldNow() to allow scheduled effects to run
```

---

### Example Usage in AGENT_PROMPTS.md

```markdown
### test-writer: UserService Tests

Create tests for UserService authentication methods.

Target: packages/iam/server/test/services/UserService.test.ts

Test coverage required:
1. signup creates user with hashed password
2. signin validates credentials
3. signin fails with invalid password
4. signup fails with duplicate email

CRITICAL Testing Patterns (from specs/_guide/patterns/effect-testing-standards.md):

1. Test Bodies - Use Effect.fn(function* () {...})
   - REQUIRED: effect("test name", Effect.fn(function* () {...}))
   - FORBIDDEN: effect("test name", () => Effect.gen(function* () {...}))

2. Layer Composition - Use layer() utility for shared layers
   - REQUIRED: layer(TestLayer)("suite", (it) => { it.effect(...) })

const TestLayer = Layer.mergeAll(
  DbConnectionLive,
  UserRepoLive,
  UserServiceLive
)

layer(TestLayer, { timeout: Duration.seconds(60) })("UserService", (it) => {
  it.effect("creates user", Effect.fn(function* () {
    const service = yield* UserService
    const user = yield* service.signup({ email: "test@example.com", password: "secret" })
    assertTrue(user.email === "test@example.com")
    assertTrue(user.hashedPassword !== "secret")  // Password is hashed
  }))
})

Verification:
bun run test --filter @beep/iam-server
bun run check --filter @beep/iam-server
```
