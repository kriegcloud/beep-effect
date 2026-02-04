# zero-email-port: Reflection Log

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

### Entry 1: Zero Repository Exploration

**Date**: 2026-01-29

#### What Worked

1. **Systematic Router Inventory**: Cataloguing all 16 tRPC routers with procedure counts (see MAPPING.md) provided clear scope boundaries. This prevented scope creep and enabled accurate complexity scoring.
2. **Zod-to-Effect Schema Mapping Table**: Creating a translation table (`z.string()` -> `S.String`, etc.) upfront eliminated repeated research during implementation planning.
3. **Feature Categorization by Phase**: Grouping routers by dependency (P2: mail/drafts/labels/connections, P3: templates/notes/shortcuts/settings, P4: AI features) revealed natural implementation order.

#### What Didn't Work

1. **Initial AI Framework Assumption**: Initially planned to wrap Vercel AI SDK directly. Upon closer examination, discovered Zero uses Vercel AI for streaming which conflicts with Effect's resource management patterns. Decision: replace with @effect/ai for provider abstraction and streaming.
2. **Underestimating OAuth Complexity**: Zero's connection management involves token refresh, scope validation, and multi-provider support. Initial estimate of "one driver per provider" was too simplistic.

#### Methodology Improvements

1. **AI SDK Replacement Decision**: When porting AI-heavy features, always evaluate whether the original SDK's patterns (streaming, tool calling) align with Effect patterns before committing to a wrapper approach.

#### Codebase-Specific Insights

1. **Zero's tRPC Context Pattern**: Zero uses `ctx.activeConnection` to inject the current email provider connection into procedures. This maps cleanly to Effect's `Context.Tag` pattern for ActiveConnection service.
2. **Gmail/Outlook Abstraction**: Zero already abstracts providers behind a `driver` interface. This confirms the MailDriver service pattern is the right approach.

---

### Entry 2: Existing Gmail Integration Discovery

**Date**: 2026-01-29

#### What Worked

1. **WrapperGroup Pattern Recognition**: Discovered `packages/shared/integrations/src/google/gmail/` already implements 12 Gmail operations using Effect's `Wrap.WrapperGroup` pattern.
2. **Error Type Catalog**: Found `GmailMethodError` union type with `fromUnknown` factory, enabling type-safe error handling from Google API responses.
3. **Decision: Extend, Not Rebuild**: Recognizing the existing 12 operations (list-emails, get-email, send-email, modify-email, delete-email, trash-email, batch-modify, list-labels, create-label, update-label, delete-label, search-emails) meant P1 work is "extend existing WrapperGroup" not "create new integration."

#### What Didn't Work

1. **Missing Draft Operations**: The existing integration lacks draft-specific operations (create-draft, get-draft, list-drafts, send-draft, delete-draft). These must be added to the WrapperGroup.
2. **No Thread Operations**: Zero uses thread-centric operations (getThread, listThreads) while the existing integration is message-centric (get-email, list-emails). Thread abstraction layer needed.

#### Methodology Improvements

1. **Always Audit Existing Integrations First**: Before designing new services, exhaustively search for existing implementations. The Gmail integration discovery saved an estimated 40+ hours of redundant work.

#### Codebase-Specific Insights

1. **Wrapper Pattern**: Each Gmail action follows the structure: `contract.ts` (PayloadFrom, Success, Wrapper), `handler.ts` (Wrapper.implement), `index.ts`, `mod.ts`. This 4-file pattern is canonical and must be followed.
2. **wrapGmailCall Helper**: Centralized error handling via `common/wrap-gmail-call.ts` transforms Google API errors into typed `GmailMethodError` instances. All new operations must use this helper.

---

### Entry 3: Effect AI Pattern Research

**Date**: 2026-01-29

#### What Worked

1. **MCP-Researcher for @effect/ai Documentation**: Using the Effect docs MCP tool revealed the LanguageModel service pattern for provider abstraction. This enables swapping providers (OpenAI, Anthropic) without code changes.
2. **Tool/Toolkit Composition Pattern**: @effect/ai provides `Tool.make` and `Toolkit.make` for structured function calling. Zero's AI features (compose assist, web search, Brain auto-labeling) map directly to Tool definitions.
3. **Streaming via SubscriptionRef**: Effect AI uses `SubscriptionRef` for streaming responses, which integrates cleanly with the VM pattern's reactive state atoms.

#### What Didn't Work

1. **Initial Vercel AI SDK Assumption**: Assumed we could wrap `ai` package's `streamText` directly. Effect AI provides its own streaming primitives that are resource-safe and composable. Wrapper approach would lose these benefits.

#### Methodology Improvements

1. **Consult Effect Docs MCP Before External Research**: The official Effect documentation (via mcp-researcher) should be the first source for any Effect-related patterns. External blogs and tutorials may describe outdated APIs.

#### Prompt Refinements

**Original (generic)**:
```
Research how to implement AI features with streaming
```

**Refined (contextualized)**:
```
<context>
Package: @effect/ai
Task: Port Zero's compose assist feature
Constraint: Must use Effect's resource management
</context>

Research @effect/ai patterns for:
1. LanguageModel service abstraction
2. Streaming responses (SubscriptionRef)
3. Tool/Toolkit composition for function calling
```

#### Codebase-Specific Insights

1. **AI Service Architecture**: P4 AI features require a centralized `AiService` that provides `LanguageModel` as a dependency. RPC handlers should not directly call provider SDKs.

---

### Entry 4: Six-Phase Architecture Decision

**Date**: 2026-01-29

#### What Worked

1. **Dependency-Driven Sequencing**: Phases ordered by dependency graph (P0 foundation -> P1 drivers -> P2 core -> P3 user -> P4 AI -> P5 UI) ensures each phase has stable dependencies.
2. **Separate Foundation Phase (P0)**: Isolating EntityIds, domain models, and error types into P0 means P1+ phases have type-safe primitives available.
3. **Driver Phase Before RPC (P1 < P2)**: MailDriver abstraction must exist before RPC handlers can be implemented, since handlers depend on the driver service.

#### What Didn't Work

1. **Initial 4-Phase Plan**: Originally proposed combining P0+P1 and P2+P3. This created phases with too many deliverables (>15 files each), making progress tracking difficult.

#### Methodology Improvements

1. **Phase Size Heuristic**: Each phase should have 5-15 primary deliverables. Phases with >15 deliverables should be split.
2. **Dependency Verification**: Before finalizing phase boundaries, draw the dependency graph and verify no phase depends on outputs from later phases.

#### Codebase-Specific Insights

1. **AI Depends on Core**: P4 AI features need access to thread content (P2) and user settings (P3) for context-aware generation. This confirms P4 must follow P2 and P3.
2. **UI Requires All Endpoints**: P5 UI components invoke RPC endpoints from all previous phases. UI must be final phase.

---

### Entry 5: Orchestrator Prompt Evolution

**Date**: 2026-01-29

#### What Worked

1. **Contextualization Tags**: Adding `<context>`, `<scope>`, `<constraints>` tags to prompts improved agent focus. Agents no longer explored irrelevant patterns.
2. **Tiered Memory Model in Handoffs**: Handoff documents now use CRITICAL/IMPORTANT/HELPFUL tiers to prioritize information for the next session.
3. **Specific File Path References**: Including absolute paths (`packages/shared/integrations/src/google/gmail/actions/send-email/`) rather than relative or vague references eliminated navigation overhead.

#### What Didn't Work

1. **Initial Prompts Lacked Constraints**: Early prompts like "Implement the email drivers" were too open-ended. Agents explored tangential patterns (caching, retries) before core functionality.
2. **Missing Success Criteria**: Prompts without explicit success criteria led to incomplete deliverables. Agents stopped work at arbitrary points.

#### Methodology Improvements

1. **Every Prompt Needs**: (a) Context tag with relevant files, (b) Scope limitations, (c) Explicit success criteria with verification commands.
2. **Agent Prompt Template**:
```markdown
<context>
- Package: [target package]
- Phase: [P0-P5]
- Relevant Files: [specific paths]
</context>

## Task
[Clear imperative description]

## Constraints
- [Boundary 1]
- [Boundary 2]

## Success Criteria
- [ ] [Verifiable criterion with command]
- [ ] [Another criterion]

## Verification
[Copy-paste verification commands]
```

#### Prompt Refinements

**Before (vague)**:
```
Create domain models for the email features
```

**After (precise)**:
```markdown
<context>
Package: @beep/comms-domain
Phase: P0
Files to Create:
- packages/comms/domain/src/entities/connection/connection.model.ts
- packages/comms/domain/src/entities/thread-summary/thread-summary.model.ts
Pattern Reference: packages/iam/domain/src/entities/member/member.model.ts
</context>

## Task
Create domain models for Connection and ThreadSummary entities using M.Class pattern.

## Constraints
- Use makeFields from @beep/shared-domain/common
- Use CommsEntityIds for id fields
- Mark accessToken/refreshToken as sensitive (BS.FieldSensitiveOptionOmittable)

## Success Criteria
- [ ] `bun run check --filter @beep/comms-domain` passes
- [ ] No `any` types: `grep -r "any" packages/comms/domain/src/ | wc -l` returns 0
- [ ] EntityIds branded: `grep -rn "CommsEntityIds" packages/comms/domain/src/ | wc -l` > 0

## Verification
bun run check --filter @beep/comms-domain
grep -r "any" packages/comms/domain/src/
```

---

### Entry 6: Phase P0 - Foundation Complete

**Date**: 2026-01-29

#### What Worked

1. **CommsEntityIds Pre-Scaffolded Structure**: The `packages/shared/domain/src/entity-ids/comms/` directory already existed with `EmailTemplateId`, making extension straightforward. Adding 5 new EntityIds (ConnectionId, ThreadSummaryId, NoteId, UserSettingsId, UserHotkeysId) required only new files following the established pattern.

2. **Parallel Agent Orchestration**: EntityIds and Error types could be created in parallel since errors don't depend on the new EntityIds. This reduced wall-clock time for P0 completion.

3. **Sensitive Field Pattern Application**: OAuth tokens (`accessToken`, `refreshToken`) correctly use `BS.FieldSensitiveOptionOmittable` which suppresses these values in logs. This pattern from the effect-patterns rules was immediately applicable.

4. **Six-Table Schema Design**: Tables (connections, threads_summary, notes, user_settings, user_hotkeys, drafts) have clean foreign key relationships without circular dependencies. The Table.make factory handled audit columns automatically.

#### What Didn't Work

1. **Optional Field Pattern Mismatch**: Domain models use `S.optional(S.String)` which produces `string | undefined`, but Drizzle columns with `.default(null)` produce `string | null`. The type assertion in `_check.ts` files had to be disabled for these fields. This is a known pattern debt.

2. **Type Check Cascading**: Running `bun run check --filter @beep/comms-tables` also checks all upstream dependencies (`@beep/comms-domain`, `@beep/shared-domain`). Pre-existing errors in unrelated packages caused initial verification confusion.

3. **Missing Notes Table Columns**: Initial `notes` table design omitted `emailId` column, requiring a follow-up edit. The Zero source showed notes are per-email, not just per-thread.

#### Methodology Improvements

1. **Domain Model Field Selection**: For nullable DB columns, prefer `BS.FieldOptionOmittable(S.String)` over `S.optional(S.String)` to align with Drizzle's null semantics.

2. **Isolated Syntax Check for New Packages**: When upstream packages have pre-existing errors, use `bun tsc --noEmit --isolatedModules path/to/file.ts` to verify new code in isolation.

3. **Table Column Audit Checklist**: Before creating tables, enumerate all foreign keys and nullable columns from the Zero source, then verify 1:1 mapping.

#### Prompt Refinements

**Original (missing explicit deliverable list)**:
```
Create domain models for Connection and ThreadSummary
```

**Refined (with exhaustive deliverable enumeration)**:
```markdown
<context>
Phase: P0
Package: @beep/comms-domain
</context>

## Deliverables
1. packages/comms/domain/src/entities/connection/connection.model.ts
2. packages/comms/domain/src/entities/thread-summary/thread-summary.model.ts
3. packages/comms/domain/src/entities/note/note.model.ts
4. packages/comms/domain/src/entities/user-settings/user-settings.model.ts
5. packages/comms/domain/src/entities/user-hotkeys/user-hotkeys.model.ts

## Pattern Reference
- packages/iam/domain/src/entities/member/member.model.ts (M.Class with makeFields)

## Success Criteria
- [ ] All 5 model files exist
- [ ] All use branded EntityIds (not S.String for id fields)
- [ ] accessToken/refreshToken use BS.FieldSensitiveOptionOmittable
```

#### Codebase-Specific Insights

1. **EntityId Module Structure**: Each EntityId lives in its own file under `packages/shared/domain/src/entity-ids/{slice}/`. The barrel export at `comms/mod.ts` must be updated when adding new IDs.

2. **Table Factory Automatic Audit Columns**: `Table.make(EntityId)` automatically adds `id`, `createdAt`, `updatedAt` columns. Custom audit columns are not needed in the table definition.

3. **Drizzle Relations Pattern**: Relations are defined separately from tables using `relations()` from `drizzle-orm`. Foreign keys reference the table constant, not a string name.

4. **Error Type Barrel Exports**: Error types in `packages/comms/domain/src/errors/` must be re-exported from both the errors barrel (`errors.ts`) and the main package barrel (`mod.ts`).

---

### Entry Template (Copy for Each Phase)

### Entry N: Phase P[X] - [Phase Name]

**Date**: [YYYY-MM-DD]

#### What Worked

1. [Technique/approach that was effective]
2. [Another effective technique]

#### What Didn't Work

1. [Approach that failed or was inefficient]
2. [Another ineffective approach]

#### Methodology Improvements

1. [Change to apply in future phases]
2. [Another improvement]

#### Prompt Refinements

**Original issue**: [Description of prompt issue]
**Refined**: [How the prompt was improved]

#### Codebase-Specific Insights

1. [Pattern unique to this repo]
2. [Another repo-specific insight]

---

## Accumulated Improvements

### Template Updates

1. **Agent Prompt Template**: Every prompt now requires `<context>`, `## Constraints`, `## Success Criteria`, and `## Verification` sections. See Entry 5 for template.
2. **Handoff Tiered Memory**: Handoff documents now use CRITICAL/IMPORTANT/HELPFUL tiers to prioritize information for subsequent sessions.
3. **Phase Size Heuristic**: Added guidance that phases should have 5-15 primary deliverables; larger phases should be split.
4. **Exhaustive Deliverable Enumeration**: Prompts should list every file path to be created/modified, not just categories. See Entry 6.

### Process Updates

1. **Existing Integration Audit**: Before designing new services, search for existing implementations in `packages/shared/integrations/` and slice packages.
2. **Effect Docs MCP First**: Consult `mcp-researcher` with Effect docs before external research for any Effect-related patterns.
3. **AI SDK Evaluation**: When porting AI features, evaluate whether original SDK patterns align with Effect before committing to wrapper approach.
4. **Isolated Syntax Check**: When upstream packages have pre-existing errors, use `bun tsc --noEmit --isolatedModules` to verify new code in isolation.
5. **Nullable Field Alignment**: For DB-backed nullable fields, prefer `BS.FieldOptionOmittable()` over `S.optional()` to align with Drizzle's null semantics.

---

## Lessons Learned Summary

### Top Techniques

1. **Systematic Router Inventory with Counts**: Cataloguing Zero's 16 routers with procedure counts provided scope boundaries and accurate complexity scoring.
2. **Translation Table Upfront**: Zod-to-Effect Schema mapping table eliminated repeated research during implementation.
3. **Dependency-Driven Phase Sequencing**: Drawing the dependency graph before finalizing phases prevented circular dependencies.
4. **Contextualization Tags in Prompts**: `<context>`, `<scope>`, `<constraints>` tags improved agent focus significantly.
5. **Tiered Handoff Information**: CRITICAL/IMPORTANT/HELPFUL tiers ensure next-session agents prioritize correctly.
6. **Parallel Agent Orchestration**: Independent deliverables (e.g., EntityIds and Error types) can be created in parallel to reduce wall-clock time.
7. **Pre-Scaffolded Infrastructure**: Existing directory structures (like `entity-ids/comms/`) accelerate foundation phases by providing established patterns to follow.

### Top Pitfalls

1. **Assuming Wrapper Approach for AI SDKs**: Vercel AI SDK's streaming patterns conflict with Effect's resource management. Always evaluate before committing.
2. **Open-Ended Prompts**: Prompts without explicit success criteria led to incomplete deliverables.
3. **Missing Existing Integration Discovery**: Nearly duplicated Gmail integration work before discovering 12 operations already existed.
4. **Over-Large Phases**: Initial 4-phase plan had phases with >15 deliverables, making tracking difficult.
5. **Thread vs Message Abstraction Gap**: Zero uses thread-centric operations; existing Gmail integration is message-centric. Abstraction layer needed.
6. **Optional/Nullable Mismatch**: `S.optional()` produces `undefined` while Drizzle columns produce `null`. Use `BS.FieldOptionOmittable()` for DB-backed nullable fields.
7. **Type Check Cascading Confusion**: Turborepo's `--filter` checks all dependencies; pre-existing errors cause verification confusion. Use isolated syntax checks when needed.

---

## Cross-Phase Insights

### Pattern Discoveries

1. **Gmail WrapperGroup Pattern**: 4-file structure (contract.ts, handler.ts, index.ts, mod.ts) is canonical for all Gmail operations.
2. **wrapGmailCall Helper**: Centralized error transformation must be used by all Gmail operations.
3. **MailDriver Abstraction**: Zero's driver interface maps directly to Effect `Context.Tag` pattern.
4. **@effect/ai Streaming**: SubscriptionRef pattern for streaming integrates with VM reactive atoms.

### Conflicts Between Sources

1. **Vercel AI SDK vs @effect/ai**: Vercel's streaming primitives don't compose with Effect's resource management. Resolution: Use @effect/ai exclusively.
2. **Message-Centric vs Thread-Centric**: Existing Gmail integration uses message IDs; Zero uses thread IDs. Resolution: Build thread abstraction layer on top of message operations.

---

## Handoff Notes

### For Next Session (P1 - Email Drivers)

**CRITICAL**:
- P0 COMPLETE: EntityIds, domain models, error types, and tables are ready
- Existing Gmail integration at `packages/shared/integrations/src/google/gmail/` has 12 operations; extend this for drafts
- AI features require @effect/ai, not Vercel AI SDK wrapper
- Connection repository needed for drivers to look up OAuth tokens

**IMPORTANT**:
- Thread-centric abstraction layer needed over message-centric Gmail operations
- Draft operations (create, get, list, send, delete) missing from existing Gmail integration
- Domain models use `S.optional()` producing `undefined`; Drizzle columns produce `null` - type assertions needed
- All prompts must include `<context>`, success criteria, and verification commands

**HELPFUL**:
- Complexity score: 77 (CRITICAL) - full spec structure required
- Zero has ~70 procedures across 12 in-scope routers
- Gmail operations follow 4-file pattern (contract/handler/index/mod)
- CommsEntityIds exports: ConnectionId, ThreadSummaryId, NoteId, UserSettingsId, UserHotkeysId
- Error types: MailError, ConnectionNotFoundError, ConnectionExpiredError, ProviderApiError, ThreadNotFoundError, DraftNotFoundError, LabelOperationError, SendEmailError, AiServiceError

### P0 Deliverables Summary

| Category | Count | Location |
|----------|-------|----------|
| EntityIds | 5 | `@beep/shared-domain/entity-ids/comms/` |
| Domain Models | 5 | `@beep/comms-domain/entities/` |
| Error Types | 9 | `@beep/comms-domain/errors/` |
| Tables | 6 | `@beep/comms-tables/` |
