# integration-architecture-migration: Reflection Log

> Cumulative learnings from spec creation and implementation phases.

---

## Reflection Protocol

After each phase, document:

1. **What Worked** - Techniques that were effective
2. **What Didn't Work** - Approaches that failed or were inefficient
3. **Methodology Improvements** - Changes to apply in future phases
4. **Prompt Refinements** - Updated prompts based on learnings
5. **Codebase-Specific Insights** - Patterns unique to this repo

---

## Reflection Entries

### Phase 0: Scaffolding (2026-02-03)

**What Worked:**

- Prior research phase with codebase-explorer and web-researcher agents provided comprehensive architecture understanding before spec creation
- Three-tier pattern (infrastructure → credentials → adapters) clearly identified from industry best practices (OAuth 2.0 RFC 6749, JWT RFC 7519)
- Complexity calculation (score 64) with transparent rubric justified Critical classification and multi-phase approach
- Domain ownership model (IAM owns TokenStore, slices own adapters) aligned with existing monorepo boundaries
- MASTER_ORCHESTRATION.md structure provided clear agent-to-phase mapping and dependency tracking

**What Didn't Work:**

- Initial doc-writer parallelization created 6 interdependent files simultaneously - sequential creation with validation checkpoints would have caught cross-reference inconsistencies earlier
- Handoff file creation delegated to doc-writer without immediate verification - should validate completeness before phase transitions

**Methodology Improvements:**

1. For complex specs (score >60), use sequential doc creation with validation after each file:
   - Create CONTEXT_DOCUMENT.md → validate
   - Create ARCHITECTURE_BLUEPRINT.md → validate cross-references
   - Create IMPLEMENTATION_GUIDE.md → validate consistency
2. Add explicit handoff verification step to orchestration protocol
3. Consider adding "Pre-Scaffolding Research" as formal Phase -1 for Critical specs

**Prompt Refinements:**

```markdown
# Enhanced doc-writer prompt for complex specs:
When creating interdependent documentation files:
1. Generate files sequentially (not in parallel)
2. After each file, verify cross-references to existing files
3. Flag any inconsistencies for immediate resolution
4. Only proceed to next file after validation passes
```

**Codebase-Specific Insights:**

1. **IAM Centralization**: Token storage and refresh logic belongs in IAM slice, not integration infrastructure - prevents duplication across slices needing OAuth
2. **Context.Tag Pattern**: Interface in client package, implementation in server package - enables testing without server dependencies
3. **ACL Translation Boundary**: Permission mapping happens in slice adapters, not shared integration code - each slice owns its authorization semantics
4. **Incremental OAuth Flow**: Use `ScopeExpansionRequired` error to trigger dynamic consent requests - avoids upfront "kitchen sink" permission requests

**Decisions Made:**

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| IAM owns TokenStore | Centralized security policy enforcement | Integration package ownership (rejected - causes slice coupling) |
| Context.Tag in client pkg | Testing isolation | Monolithic server-only service (rejected - untestable clients) |
| Incremental OAuth scopes | Better UX, principle of least privilege | Upfront max permissions (rejected - privacy concerns) |
| ACL in slice adapters | Domain-specific authorization | Shared mapping table (rejected - tight coupling) |

**Patterns Extracted:**

1. **Three-Tier Integration Pattern** (Skill-worthy, ~85 reusability score):
   - Layer 1: Infrastructure (HttpClient, credentials storage)
   - Layer 2: Credentials management (OAuth flow, token refresh)
   - Layer 3: Domain adapters (API-specific logic, ACL translation)
   - Candidate for `.claude/skills/integration-patterns/`

2. **Anti-Corruption Layer Pattern**: Slice adapters transform third-party API responses to domain entities via transformation schemas - prevents external API changes from cascading into business logic

---

## Accumulated Improvements

### Template Updates

1. **Complex Spec Documentation Protocol** (from P0):
   - Sequential file creation with validation checkpoints for specs with score >60
   - Mandatory handoff verification before phase transitions

### Process Updates

1. **Pre-Scaffolding Research Phase** (from P0):
   - Use codebase-explorer and web-researcher agents before spec creation for Critical specs
   - Document architecture patterns from industry standards (RFCs, best practices) in research outputs

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques
1. **Pre-spec research phase**: Using specialized agents (codebase-explorer, web-researcher) before documentation prevented architectural blind spots
2. **Transparent complexity scoring**: Rubric-based classification (64/100 = Critical) justified resource allocation and multi-phase approach
3. **Domain ownership model**: Clear boundaries (IAM owns tokens, slices own adapters) aligned with existing monorepo structure

### Top 3 Wasted Efforts
1. **Parallel documentation creation**: Creating 6 interdependent files simultaneously caused cross-reference inconsistencies requiring rework
2. **Missing handoff verification**: Delegating handoff creation without validation checkpoint delayed phase transitions
3. **Pre-specified stub interfaces**: Planning IntegrationTokenStore stub interface before implementation when simpler placeholder implementations suffice

### Phase 1b: Client/Server Packages (2026-02-03)

**What Worked:**

1. **Parallel agent delegation**: Spawning effect-code-writer agents for client and server packages with full contextualization enabled efficient execution
2. **Context.Tag interface pattern**: Clean separation with interface in client, implementation in server matched existing codebase patterns
3. **Placeholder Layer implementations**: Using `Layer.succeed` with `Effect.fail` for unimplemented methods provided clear compilation checkpoints
4. **Simplified OAuth schemas**: Using `S.optional(S.String)` for optional OAuth response fields was cleaner than `BS.FieldOptionOmittable` for plain Schema classes (latter is for @effect/sql/Model)
5. **Identity composer reuse**: `$GoogleWorkspaceClientId` and `$GoogleWorkspaceServerId` already registered in P1a, avoided double-registration errors

**What Didn't Work:**

1. **Initial tsconfig path alias error**: Domain package path pointed to `domain/index` instead of `domain/src/index` - caught and fixed during verification
2. **Lint formatting issues**: Generated code had minor formatting differences from Biome expectations - required `lint:fix` pass

**Methodology Improvements:**

1. For placeholder implementations, use `Layer.succeed` with `Effect.fail(new TaggedError({message: "Not implemented - Phase N will add..."}))` - provides clear traceability
2. When delegating package creation, always include:
   - Full package.json template
   - All three tsconfig files (tsconfig.json, tsconfig.src.json, tsconfig.build.json)
   - tsconfig references to dependency packages
3. Run `lint:fix` after code generation to normalize formatting

**Prompt Refinements:**

```markdown
# Enhanced package creation prompt:
When creating new packages in packages/integrations/:
1. Use four-level relative path for extends: "../../../../tsconfig.base.jsonc"
2. Add tsconfig references to all internal dependencies
3. Use S.optional() for optional Schema.Class fields, NOT BS.FieldOptionOmittable
4. Run bun install + lint:fix after package creation
```

**Codebase-Specific Insights:**

1. **BS.FieldOptionOmittable vs S.optional**: Use `BS.FieldOptionOmittable` only for `@effect/sql/Model` classes (with variant schemas); use `S.optional` for regular `S.Class` definitions
2. **Context.Tag typing**: Use `import type * as Effect from "effect/Effect"` in interface files to avoid runtime imports
3. **Placeholder error messages**: Include "Phase N will add..." text to trace which phase owns the implementation

**Decisions Made:**

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| Layer.succeed for placeholders | No dependencies needed for failing implementations | Layer.effect (rejected - unnecessary complexity) |
| S.optional for OAuth schemas | OAuth response schemas are simple S.Class | BS.FieldOptionOmittable (rejected - for Model classes only) |
| Re-export client types from server | Consumer convenience, single import source | Separate imports (rejected - adds friction) |

**Patterns Extracted:**

1. **Placeholder Layer Pattern** (Useful for phased development):
   ```typescript
   export const ServiceLive = Layer.succeed(
     ServiceTag,
     ServiceTag.of({
       method: (_arg) => Effect.fail(new ServiceError({
         message: "Not implemented - Phase N will add X integration"
       }))
     })
   );
   ```
   - Compiles successfully
   - Clear error messages for testing
   - Traceable to implementation phase

---

### Phase 2: IntegrationTokenStore Implementation (2026-02-03)

**What Worked:**

1. **Parallel exploration agents**: Running 3 Explore agents simultaneously (IAM patterns, Google Workspace packages, shared tables patterns) provided comprehensive context in ~2 minutes
2. **EntityId creation in shared-domain**: Creating `IntegrationsEntityIds.IntegrationTokenId` in a new `entity-ids/integrations/` namespace kept cross-slice dependencies clean
3. **Interface relocation decision**: Moving `IntegrationTokenStore` interface from `@beep/iam-client` to `@beep/iam-domain` during implementation was architecturally better - domain layer is the right place for service interfaces
4. **OrgTable.make pattern**: Using OrgTable instead of base Table automatically added RLS policies and organizationId foreign key
5. **Internal helper functions pattern**: Defining `getImpl` and `storeImpl` as closures allowed the `refresh` method to call them while keeping proper error propagation

**What Didn't Work:**

1. **Agent timeout on IntegrationTokenStoreLive**: Complex implementation with encryption, database operations, and Effect patterns took longer than expected - required multiple timeout extensions
2. **Import path assumptions**: Initial agent assumed `/services` and `/db` subpath exports existed in `@beep/iam-*` packages - had to discover correct import paths
3. **Effect.orDie for interface conformance**: The interface specifies `get`, `store`, `revoke` return `Effect<_, never, _>` (no errors) but implementation has internal errors - using `Effect.orDie` converts errors to defects, which may not be ideal for production

**Methodology Improvements:**

1. For complex service implementations, break into smaller focused agents:
   - Agent 1: Create EntityId and table
   - Agent 2: Create service interface
   - Agent 3: Create implementation layer
   - This avoids timeout issues and enables better error recovery

2. When service interface specifies no error channel (`Effect<A, never, R>`), document whether:
   - Errors should become defects (current approach via `Effect.orDie`)
   - Interface should be updated to include error types
   - Implementation should handle all errors internally

3. For encryption services, verify the exact API shape before implementation:
   - `EncryptionService.encrypt` returns `{iv, ciphertext, algorithm}`
   - `EncryptionService.importKeyFromBase64` for key loading
   - Schema validation of encrypted payloads before database storage

**Prompt Refinements:**

```markdown
# Enhanced IntegrationTokenStore implementation prompt:
When implementing encrypted token storage:
1. Use Config.redacted for encryption keys from environment
2. Store encrypted payload as JSON string with {iv, ciphertext, algorithm}
3. Define internal `getImpl`/`storeImpl` helpers that can be called from `refresh`
4. Use Effect.orDie for interface methods that specify no error channel
5. Add Effect.withSpan for OpenTelemetry observability
```

**Codebase-Specific Insights:**

1. **EncryptionService API**: Located at `@beep/shared-domain/services/EncryptionService` with `importKeyFromBase64`, `encrypt`, `decrypt` methods
2. **IamDb.Db shape**: Returns `{client}` where client is the Drizzle database instance
3. **DbSchema exports**: Tables are exported from `@beep/iam-tables/schema` (not `/tables`)
4. **Effect.tryPromise pattern**: Use for wrapping Drizzle queries with typed error handling
5. **DateTime.now vs Clock.currentTimeMillis**: Use `DateTime.now` for formatted ISO strings, `Clock.currentTimeMillis` for epoch timestamps

**Decisions Made:**

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| IntegrationsEntityIds in shared-domain | Cross-slice entity, shared ownership | iam-domain (rejected - would create dependency from integrations to iam) |
| Interface in @beep/iam-domain | Clean dependency graph, domain contains contracts | @beep/iam-client (rejected - client shouldn't define domain contracts) |
| Effect.orDie for silent methods | Interface contract compliance | Update interface (rejected - would require downstream changes) |
| JSON string for encrypted payload | Simpler than binary, debuggable | Binary blob (rejected - harder to inspect/debug) |
| Config.redacted for encryption key | Secure key management, Effect-native | process.env direct (rejected - not Effect idiomatic, no redaction) |

**Patterns Extracted:**

1. **Encrypted Token Storage Pattern** (Skill-worthy):
   ```typescript
   // 1. Encrypt token with schema validation
   const encryptToken = (token: string) =>
     Effect.gen(function* () {
       const key = yield* getEncryptionKey;
       const encrypted = yield* encryption.encrypt(token, key);
       return yield* S.encode(S.parseJson(EncryptedPayloadSchema))(encrypted);
     });

   // 2. Store as JSON string in database
   // 3. Decrypt on retrieval with schema validation
   ```

2. **Internal Helper Pattern** for service implementations:
   ```typescript
   // Define helpers that can be called internally (for refresh)
   const getImpl = (userId, provider) => Effect.gen(...);
   const storeImpl = (userId, provider, token) => Effect.gen(...);

   return Service.of({
     get: (userId, provider) => getImpl(userId, provider).pipe(Effect.orDie),
     refresh: (userId, provider, fn) => Effect.gen(function* () {
       const token = yield* getImpl(userId, provider); // Can access directly
       // ...
     })
   });
   ```

**Phase 2 Deliverables:**

- [x] `IntegrationsEntityIds.IntegrationTokenId` in `@beep/shared-domain`
- [x] `IntegrationTokenStore` interface in `@beep/iam-domain` (relocated from client)
- [x] `integrationToken` table in `@beep/iam-tables`
- [x] `IntegrationTokenStoreLive` layer in `@beep/iam-server`
- [x] `GoogleAuthClientLive` updated to use IntegrationTokenStore
- [x] Type checks pass for all affected packages
- [x] Lint passes for all affected packages
- [ ] Database migration (deferred - requires db:generate + db:migrate)
