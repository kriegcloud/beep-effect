# Customization & Comms AGENTS.md Alignment Report

## Executive Summary

This report audits 10 AGENTS.md files across the `packages/customization/` and `packages/comms/` directories against the synthesized best practices. Both slices follow a consistent template-based structure that provides good baseline quality but lacks certain elements that would improve AI agent effectiveness.

| Slice | Package | Score | Status |
|-------|---------|-------|--------|
| customization | server | 10/16 | MODERATE |
| customization | tables | 10/16 | MODERATE |
| customization | domain | 11/16 | MODERATE |
| customization | ui | 9/16 | MODERATE |
| customization | client | 8/16 | NEEDS IMPROVEMENT |
| comms | server | 10/16 | MODERATE |
| comms | tables | 11/16 | MODERATE |
| comms | domain | 11/16 | MODERATE |
| comms | ui | 11/16 | MODERATE |
| comms | client | 9/16 | MODERATE |

**Average Score**: 10.0/16 (MODERATE)

---

## File-by-File Analysis

---

### 1. packages/customization/server/AGENTS.md

**Score: 10/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Clear sections with headings: Purpose, Surface Map, Usage Snapshots, Authoring Guardrails, Quick Recipes, Verifications, Contributor Checklist |
| **Commands** | 2/2 | Commands with descriptions in Verifications section, filter-specific commands provided |
| **Specificity** | 1/2 | Some specific rules (Effect namespaces, Layer ordering), but others vague ("Keep repository methods focused") |
| **Constraints** | 1/2 | Some constraints present but missing emphasis keywords for critical rules |
| **Architecture** | 2/2 | Good Layer composition guidance and dependency order documentation |
| **Testing** | 1/2 | Mentions Testcontainers but lacks complete testing workflow |
| **Security** | 0/2 | No security guidance for server-side code handling user data |
| **Maintainability** | 1/2 | Reasonable file size (64 lines), good organization |

#### Issues Found

**Issue 1: Missing Emphasis Keywords on Critical Rules**
- **Location**: `packages/customization/server/AGENTS.md:25-27`
- **Problem**: Critical constraints lack emphasis keywords:
  ```markdown
  - Use Effect for all async operations — no bare Promises or async/await.
  ```
- **Suggested Fix**:
  ```markdown
  - NEVER use bare Promises or async/await — ALWAYS use Effect for async operations.
  ```

**Issue 2: Vague Repository Guidance**
- **Location**: `packages/customization/server/AGENTS.md:24`
- **Problem**: "Keep repository methods focused on data access" lacks specificity about what is and isn't data access.
- **Suggested Fix**: Provide concrete examples of what belongs in repos vs services.

**Issue 3: Missing Security Section**
- **Location**: N/A (missing)
- **Problem**: Server packages handle user data and database operations but have no security guidance.
- **Suggested Fix**: Add section covering:
  - Input validation requirements
  - Error message sanitization
  - Access control patterns

#### Missing Elements
- [ ] Security guidance for handling user data
- [ ] Warnings/Gotchas section for server-specific pitfalls
- [ ] Error recovery patterns for database operations
- [ ] Success criteria for completed work

---

### 2. packages/customization/tables/AGENTS.md

**Score: 10/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized with clear sections |
| **Commands** | 2/2 | Includes db:generate and db:migrate with descriptions |
| **Specificity** | 2/2 | Very specific guidance on Table.make, indexes, onDelete behavior |
| **Constraints** | 1/2 | Good constraints but no emphasis keywords |
| **Architecture** | 1/2 | Table patterns covered but not overall schema architecture |
| **Testing** | 0/2 | No testing guidance for table schemas |
| **Security** | 1/2 | onDelete behavior mentioned (data integrity), but no explicit security |
| **Maintainability** | 1/2 | Good size (63 lines), clear organization |

#### Issues Found

**Issue 1: Missing Testing Instructions**
- **Location**: `packages/customization/tables/AGENTS.md:50-54`
- **Problem**: Verifications section lacks test command. Schema changes should have validation tests.
- **Suggested Fix**: Add `bun run test --filter @beep/customization-tables` if tests exist, or document that schema validation is done at integration level.

**Issue 2: No Emphasis on Critical Migration Rules**
- **Location**: `packages/customization/tables/AGENTS.md:61`
- **Problem**: Migration file commitment is critical but lacks emphasis:
  ```markdown
  - [ ] Run `bun run db:generate` and commit migration files after schema changes.
  ```
- **Suggested Fix**:
  ```markdown
  - [ ] ALWAYS run `bun run db:generate` and commit migration files after schema changes. NEVER modify generated migration files manually.
  ```

**Issue 3: Missing Gotchas Section**
- **Location**: N/A (missing)
- **Problem**: No warnings about common table schema pitfalls (e.g., null vs nullable behavior, JSONB caveats).

#### Missing Elements
- [ ] Testing section for schema validation
- [ ] Gotchas for Drizzle ORM quirks
- [ ] Rollback/migration failure guidance
- [ ] Data migration patterns when schema changes

---

### 3. packages/customization/domain/AGENTS.md

**Score: 11/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Comprehensive sections following standard template |
| **Commands** | 2/2 | Complete verification commands with descriptions |
| **Specificity** | 2/2 | Highly specific guidance on makeFields, Symbol.for naming, modelKit |
| **Constraints** | 1/2 | Good constraints ("never redefine id, _rowId") but inconsistent emphasis |
| **Architecture** | 2/2 | Clear entity-to-table-to-repo flow documented |
| **Testing** | 1/2 | Mentions Vitest but lacks complete testing patterns |
| **Security** | 0/2 | No guidance on sensitive field handling in domain models |
| **Maintainability** | 1/2 | Good size (60 lines), well-organized |

#### Issues Found

**Issue 1: Inconsistent Emphasis Usage**
- **Location**: `packages/customization/domain/AGENTS.md:20`
- **Problem**: Uses "never" lowercase when it should be emphasized:
  ```markdown
  never redefine `id`, `_rowId`, `version`, or timestamps manually.
  ```
- **Suggested Fix**:
  ```markdown
  NEVER redefine `id`, `_rowId`, `version`, or timestamps manually.
  ```

**Issue 2: Missing Sensitive Data Handling**
- **Location**: N/A (missing)
- **Problem**: Domain entities may contain sensitive fields (mentioned in guardrails with FieldSensitiveOptionOmittable) but no explicit guidance on handling.
- **Suggested Fix**: Add section on marking and handling sensitive fields in domain models.

**Issue 3: Quick Recipe Uses DateTime.now Without Context**
- **Location**: `packages/customization/domain/AGENTS.md:35-36`
- **Problem**: The recipe uses `DateTime.now` without explaining it requires Effect context.
- **Suggested Fix**: Add comment explaining Effect requirement or show complete usage.

#### Missing Elements
- [ ] Sensitive field handling patterns
- [ ] Domain validation testing patterns
- [ ] Error type definitions for domain validation failures

---

### 4. packages/customization/ui/AGENTS.md

**Score: 9/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Standard template structure followed |
| **Commands** | 2/2 | Verification commands present |
| **Specificity** | 1/2 | Some specific (MUI/Tailwind patterns), others vague ("business logic should live in contracts") |
| **Constraints** | 1/2 | Some constraints but missing key emphasis |
| **Architecture** | 1/2 | Component-contract relationship mentioned but not detailed |
| **Testing** | 0/2 | Mentions Storybook but no actual testing guidance |
| **Security** | 1/2 | No explicit security but UI is lower risk |
| **Maintainability** | 1/2 | Reasonable size (61 lines) |

#### Issues Found

**Issue 1: Placeholder Surface Map**
- **Location**: `packages/customization/ui/AGENTS.md:10-11`
- **Problem**: Surface Map shows only "beep" placeholder, providing no useful information about actual exports.
- **Suggested Fix**: Either list planned components or mark as "No exports - awaiting implementation".

**Issue 2: Missing Accessibility Guidance**
- **Location**: N/A (missing)
- **Problem**: UI package lacks accessibility (a11y) guidance unlike comms-ui which includes it.
- **Suggested Fix**: Add accessibility requirements to Authoring Guardrails.

**Issue 3: Commented-Out Recipe**
- **Location**: `packages/customization/ui/AGENTS.md:32-38`
- **Problem**: Quick Recipe has commented-out code making it non-functional as an example.
- **Suggested Fix**: Either provide working example or mark as "Pattern to follow when contracts are implemented".

**Issue 4: No Testing Workflow**
- **Location**: N/A (missing)
- **Problem**: Mentions Storybook in checklist but no guidance on component testing.
- **Suggested Fix**: Add testing section covering:
  - Unit testing with Vitest
  - Visual testing with Storybook
  - Integration testing patterns

#### Missing Elements
- [ ] Accessibility (a11y) requirements
- [ ] Component testing patterns
- [ ] State management guidance
- [ ] Error boundary patterns for React components

---

### 5. packages/customization/client/AGENTS.md

**Score: 8/16** | **Status: NEEDS IMPROVEMENT**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Standard template structure |
| **Commands** | 2/2 | Verification commands present |
| **Specificity** | 1/2 | Some specific (@beep/contract patterns), but lacks concrete examples |
| **Constraints** | 1/2 | Basic constraints without emphasis |
| **Architecture** | 0/2 | No architecture guidance for contract design patterns |
| **Testing** | 0/2 | No testing guidance for contracts |
| **Security** | 1/2 | Mentions error handling but no security specifics |
| **Maintainability** | 1/2 | Short file (35 lines), could use more content |

#### Issues Found

**Issue 1: Missing Quick Recipes**
- **Location**: N/A (missing)
- **Problem**: Unlike other packages, client has no Quick Recipes section demonstrating contract creation.
- **Suggested Fix**: Add recipe showing contract definition pattern:
  ```ts
  import { Contract } from "@beep/contract";
  import * as S from "effect/Schema";

  export const getUserHotkeys = Contract.make({
    request: S.Struct({ userId: S.String }),
    response: S.Array(HotkeySchema),
    errors: [HotkeyNotFoundError],
  });
  ```

**Issue 2: Placeholder Surface Map Unhelpful**
- **Location**: `packages/customization/client/AGENTS.md:10-11`
- **Problem**: "beep" placeholder provides no guidance on intended exports.
- **Suggested Fix**: List planned contracts or describe contract patterns.

**Issue 3: No Architecture for Contract Design**
- **Location**: N/A (missing)
- **Problem**: No guidance on how to design contracts, error typing, or request/response patterns.
- **Suggested Fix**: Add architecture section covering:
  - Contract naming conventions
  - Request/response schema patterns
  - Error type hierarchy

**Issue 4: Missing Testing Patterns**
- **Location**: N/A (missing)
- **Problem**: Contracts require testing but no patterns provided.
- **Suggested Fix**: Add testing section for contract validation.

#### Missing Elements
- [ ] Quick Recipes section with contract examples
- [ ] Architecture guidance for contract design
- [ ] Testing patterns for contracts
- [ ] Error type documentation
- [ ] Usage Snapshots lacks depth

---

### 6. packages/comms/server/AGENTS.md

**Score: 10/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Well-organized standard template |
| **Commands** | 2/2 | Complete verification commands |
| **Specificity** | 1/2 | Good patterns shown but some vague guidance |
| **Constraints** | 1/2 | Constraints present but lacking emphasis keywords |
| **Architecture** | 2/2 | Good Layer composition and dependency order |
| **Testing** | 1/2 | Testcontainers mentioned but incomplete workflow |
| **Security** | 0/2 | No security guidance for email/notification handling |
| **Maintainability** | 1/2 | 71 lines, well-organized |

#### Issues Found

**Issue 1: Missing Email Security Guidance**
- **Location**: `packages/comms/server/AGENTS.md:26`
- **Problem**: Mentions email service but no security guidance:
  ```markdown
  Email sending should use the Email service from `@beep/shared-server` with proper error channels.
  ```
- **Suggested Fix**: Add guidance on:
  - Email address validation
  - Template injection prevention
  - Rate limiting considerations

**Issue 2: PlaceholderRepo Confusion**
- **Location**: `packages/comms/server/AGENTS.md:13`
- **Problem**: Surface Map documents PlaceholderRepo which should be replaced, potentially confusing agents.
- **Suggested Fix**: Either remove or clearly mark as "DEPRECATED: Replace with actual repositories".

**Issue 3: Missing Emphasis on Critical Rules**
- **Location**: `packages/comms/server/AGENTS.md:25`
- **Problem**: Async rule lacks emphasis:
  ```markdown
  Use Effect for all async operations — no bare Promises or async/await.
  ```
- **Suggested Fix**:
  ```markdown
  NEVER use bare Promises or async/await — ALWAYS use Effect for async operations.
  ```

#### Missing Elements
- [ ] Security guidance for email/notification handling
- [ ] Rate limiting patterns for notifications
- [ ] Gotchas for email delivery issues
- [ ] Real-time (WebSocket) patterns for notifications

---

### 7. packages/comms/tables/AGENTS.md

**Score: 11/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent organization with multiple recipes |
| **Commands** | 2/2 | Complete with db:generate and db:migrate |
| **Specificity** | 2/2 | Highly specific with two detailed table recipes |
| **Constraints** | 1/2 | Good constraints but missing emphasis |
| **Architecture** | 1/2 | Table patterns shown but not schema architecture |
| **Testing** | 1/2 | Mentions integration tests but no specific guidance |
| **Security** | 1/2 | onDelete behavior covers data integrity |
| **Maintainability** | 1/2 | 89 lines, well-organized |

#### Issues Found

**Issue 1: Missing Test Verification Command**
- **Location**: `packages/comms/tables/AGENTS.md:76-80`
- **Problem**: No test command in Verifications section.
- **Suggested Fix**: Add if tests exist: `bun run test --filter @beep/comms-tables`

**Issue 2: No Emphasis on Migration Rules**
- **Location**: `packages/comms/tables/AGENTS.md:87`
- **Problem**: Migration commitment is critical but not emphasized.
- **Suggested Fix**:
  ```markdown
  ALWAYS run `bun run db:generate` and commit migration files. NEVER edit migrations manually.
  ```

**Issue 3: Placeholder Table Confusion**
- **Location**: `packages/comms/tables/AGENTS.md:11`
- **Problem**: Documents placeholder table that should be replaced.
- **Suggested Fix**: Mark as deprecated or remove from Surface Map.

#### Missing Elements
- [ ] Testing section for schema validation
- [ ] Migration rollback guidance
- [ ] Index performance considerations documentation

---

### 8. packages/comms/domain/AGENTS.md

**Score: 11/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Comprehensive standard template |
| **Commands** | 2/2 | Complete verification commands |
| **Specificity** | 2/2 | Very specific with $CommsDomainId, makeFields patterns |
| **Constraints** | 1/2 | Good constraints but inconsistent emphasis |
| **Architecture** | 2/2 | Clear entity creation flow documented |
| **Testing** | 1/2 | Mentions Vitest but incomplete patterns |
| **Security** | 0/2 | No sensitive field handling despite PII in comms |
| **Maintainability** | 1/2 | 65 lines, well-organized |

#### Issues Found

**Issue 1: Missing Sensitive Data Handling**
- **Location**: N/A (missing)
- **Problem**: Communications domain likely handles PII (email addresses, message content) but no security guidance.
- **Suggested Fix**: Add section on:
  - Marking fields as sensitive
  - Encryption at rest considerations
  - Audit logging for message access

**Issue 2: Placeholder Entity Documented**
- **Location**: `packages/comms/domain/AGENTS.md:10`
- **Problem**: Surface Map documents placeholder entity that should be replaced.
- **Suggested Fix**: Mark as "Example pattern - replace with actual entities".

**Issue 3: Lowercase "never" Inconsistency**
- **Location**: `packages/comms/domain/AGENTS.md:20`
- **Problem**: Uses lowercase "never" for critical rule.
- **Suggested Fix**: Change to "NEVER redefine".

#### Missing Elements
- [ ] PII/sensitive data handling patterns
- [ ] Message content sanitization
- [ ] Audit logging requirements

---

### 9. packages/comms/ui/AGENTS.md

**Score: 11/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Excellent organization with multiple recipes |
| **Commands** | 2/2 | Complete verification commands |
| **Specificity** | 2/2 | Detailed component recipes with accessibility mention |
| **Constraints** | 1/2 | Good constraints but missing emphasis keywords |
| **Architecture** | 1/2 | Component patterns shown but not state architecture |
| **Testing** | 1/2 | Mentions Storybook and testing in checklist |
| **Security** | 1/2 | No explicit security but mentions error handling |
| **Maintainability** | 1/2 | 124 lines - approaching modularization threshold |

#### Issues Found

**Issue 1: File Size Approaching Threshold**
- **Location**: Entire file (124 lines)
- **Problem**: At 124 lines, file is above the 100-line modularization recommendation.
- **Suggested Fix**: Consider extracting recipes to separate documentation or `.claude/rules/`.

**Issue 2: Scaffold Surface Map**
- **Location**: `packages/comms/ui/AGENTS.md:10-15`
- **Problem**: Surface Map lists future components that don't exist yet.
- **Suggested Fix**: Clearly label as "Planned Components" and add disclaimer about scaffold status.

**Issue 3: Missing Error Handling in Recipes**
- **Location**: `packages/comms/ui/AGENTS.md:33-66`
- **Problem**: Toast provider recipe doesn't handle edge cases.
- **Suggested Fix**: Add error boundary pattern and loading states.

#### Missing Elements
- [ ] Error boundary patterns for components
- [ ] Real-time update handling (WebSocket)
- [ ] Loading/skeleton state patterns
- [ ] Notification permission handling (push notifications)

---

### 10. packages/comms/client/AGENTS.md

**Score: 9/16** | **Status: MODERATE**

#### Evaluation Breakdown

| Aspect | Score | Rationale |
|--------|-------|-----------|
| **Structure** | 2/2 | Standard template structure |
| **Commands** | 2/2 | Complete verification commands |
| **Specificity** | 1/2 | Mentions patterns but lacks concrete examples |
| **Constraints** | 1/2 | Basic constraints without emphasis |
| **Architecture** | 1/2 | Mentions WebSocket but no architecture guidance |
| **Testing** | 0/2 | No testing guidance for contracts |
| **Security** | 1/2 | Mentions error handling |
| **Maintainability** | 1/2 | 41 lines, could use more content |

#### Issues Found

**Issue 1: Missing Quick Recipes**
- **Location**: N/A (missing)
- **Problem**: No Quick Recipes section despite mentioning contract patterns.
- **Suggested Fix**: Add contract definition examples for notifications and messaging.

**Issue 2: WebSocket Architecture Missing**
- **Location**: `packages/comms/client/AGENTS.md:27`
- **Problem**: Mentions WebSocket contracts but provides no patterns:
  ```markdown
  Consider real-time contract patterns for WebSocket-based features.
  ```
- **Suggested Fix**: Add WebSocket contract pattern example or architecture section.

**Issue 3: Scaffold Surface Map Vague**
- **Location**: `packages/comms/client/AGENTS.md:10-13`
- **Problem**: Lists future contracts without schema patterns.
- **Suggested Fix**: Show contract interface patterns even before implementation.

**Issue 4: No Testing Patterns**
- **Location**: N/A (missing)
- **Problem**: Contracts need testing but no patterns provided.

#### Missing Elements
- [ ] Quick Recipes section with contract examples
- [ ] WebSocket contract patterns
- [ ] Real-time subscription patterns
- [ ] Contract testing guidance

---

## Cross-Cutting Issues

### 1. Inconsistent Emphasis Keyword Usage

**Affected Files**: All 10 files
**Problem**: Critical rules use lowercase ("never", "always") instead of emphasized form (NEVER, ALWAYS)
**Impact**: Reduced adherence to critical rules by AI agents
**Recommendation**: Standardize on uppercase emphasis keywords for all critical constraints

### 2. Placeholder/Scaffold Documentation

**Affected Files**:
- `customization/ui/AGENTS.md`
- `customization/client/AGENTS.md`
- `comms/server/AGENTS.md`
- `comms/tables/AGENTS.md`
- `comms/domain/AGENTS.md`
- `comms/ui/AGENTS.md`
- `comms/client/AGENTS.md`

**Problem**: Surface Maps document placeholder exports or future planned components that don't exist
**Impact**: Agents may reference non-existent code
**Recommendation**: Clearly mark scaffold sections and provide patterns for future implementation

### 3. Missing Security Guidance

**Affected Files**: All server, domain, and client packages
**Problem**: No security sections despite handling user data, emails, and notifications
**Recommendation**: Add security sections covering:
- Input validation requirements
- Sensitive data handling
- Error message sanitization
- Rate limiting (for comms especially)

### 4. Incomplete Testing Workflow

**Affected Files**: All 10 files
**Problem**: Testing mentioned in checklists but no complete workflow documented
**Recommendation**: Add testing section with:
- How to run package-specific tests
- What testing patterns to follow
- Integration test setup requirements

### 5. Missing Gotchas/Warnings Sections

**Affected Files**: All 10 files
**Problem**: No documentation of common pitfalls or unexpected behaviors
**Recommendation**: Add Gotchas sections based on developer experience, covering:
- Effect-specific gotchas
- Drizzle ORM quirks
- React 19 patterns
- TanStack Query invalidation

### 6. Client Packages Lack Quick Recipes

**Affected Files**:
- `customization/client/AGENTS.md`
- `comms/client/AGENTS.md`

**Problem**: Client packages have no Quick Recipes despite being the primary contract definition location
**Impact**: Agents lack concrete patterns for contract creation
**Recommendation**: Add contract definition recipes showing complete patterns

---

## Recommendations Summary

### High Priority (Score Impact: +2-3)

1. **Add emphasis keywords to all critical rules**
   - Change "never" to "NEVER", "always" to "ALWAYS"
   - Affects: All 10 files

2. **Add Quick Recipes to client packages**
   - Show complete contract definition patterns
   - Affects: customization/client, comms/client

3. **Add security guidance to server packages**
   - Input validation, error sanitization, access control
   - Affects: customization/server, comms/server

4. **Clarify scaffold/placeholder status**
   - Mark non-existent exports clearly
   - Affects: 7 files with placeholders

### Medium Priority (Score Impact: +1-2)

5. **Add complete testing sections**
   - Beyond verification commands, document testing patterns
   - Affects: All 10 files

6. **Add Gotchas/Warnings sections**
   - Document common pitfalls per package
   - Affects: All 10 files

7. **Add accessibility guidance to UI packages**
   - Currently only in comms/ui, missing from customization/ui
   - Affects: customization/ui

8. **Add WebSocket patterns to comms packages**
   - Document real-time communication patterns
   - Affects: comms/client, comms/ui, comms/server

### Low Priority (Score Impact: +0-1)

9. **Consider modularizing comms/ui**
   - At 124 lines, exceeds 100-line recommendation
   - Affects: comms/ui

10. **Add architecture sections to client packages**
    - Contract design patterns and error hierarchies
    - Affects: customization/client, comms/client

11. **Add sensitive data handling to domain packages**
    - PII handling, especially for comms
    - Affects: customization/domain, comms/domain

---

## Score Summary

| Package | Current Score | Potential After Fixes | Priority Issues |
|---------|---------------|----------------------|-----------------|
| customization/server | 10/16 | 14/16 | Emphasis, Security |
| customization/tables | 10/16 | 13/16 | Emphasis, Testing |
| customization/domain | 11/16 | 14/16 | Emphasis, Sensitive data |
| customization/ui | 9/16 | 13/16 | A11y, Testing, Recipes |
| customization/client | 8/16 | 13/16 | Recipes, Architecture |
| comms/server | 10/16 | 14/16 | Emphasis, Security |
| comms/tables | 11/16 | 14/16 | Emphasis, Testing |
| comms/domain | 11/16 | 14/16 | Emphasis, PII handling |
| comms/ui | 11/16 | 14/16 | Modularization |
| comms/client | 9/16 | 14/16 | Recipes, WebSocket |

**Average Improvement Potential**: From 10.0/16 to 13.7/16 (+3.7 points)
