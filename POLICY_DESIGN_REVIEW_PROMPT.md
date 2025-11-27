# Policy Design Review Task

## Objective

Perform a comprehensive technical review of `POLICY_DESIGN.md` - a design document proposing integration between an Effect-based policy system and better-auth's access control features for a multi-tenant SaaS application.

## Document to Review

```
POLICY_DESIGN.md
```

## Review Context

This design document proposes an authorization architecture for a monorepo that:
- Uses **Effect** for functional, type-safe programming
- Uses **better-auth** for authentication with organization/multi-tenancy support
- Follows **vertical slice architecture** with domain models in `packages/{slice}/domain/`
- Requires **organization-scoped** authorization (multi-tenant)

## Review Criteria

Evaluate the design against the following criteria:

### 1. Architectural Soundness
- Does the integration architecture make sense for an Effect-first codebase?
- Is the separation of concerns appropriate (shared-domain vs iam-infra vs entity policies)?
- Are there any circular dependency risks?
- Does the layering respect the hexagonal architecture principles?

### 2. Type Safety
- Will the permission strings be properly typed end-to-end?
- Are there any type inference gaps between better-auth AC and Effect policies?
- Is the `Permission` schema correctly derived from the AC statement?

### 3. Multi-Tenancy Correctness
- Is organization isolation properly enforced?
- Are there any scenarios where cross-organization data leakage could occur?
- Is the `activeOrganizationId` handling robust?

### 4. Performance Considerations
- Are there any N+1 query risks in permission resolution?
- Is permission caching addressed?
- Could the middleware chain become a bottleneck?

### 5. Security Analysis
- Are there any authorization bypass vectors?
- Is the "fail closed" principle consistently applied?
- Are there TOCTOU (time-of-check-time-of-use) vulnerabilities?

### 6. Developer Experience
- Is the policy co-location pattern intuitive?
- Are the policy combinators (`all`, `any`, `withPolicy`) ergonomic?
- Will IDE autocompletion work well with this design?

### 7. Integration Feasibility
- Does the better-auth AC API match what's proposed?
- Are there any undocumented better-auth behaviors to consider?
- Is the `createAccessControl` usage correct?

### 8. Missing Considerations
- What edge cases are not addressed?
- Are there alternative approaches that should be considered?
- What testing strategies are missing?

## Reference Files for Context

To understand the existing codebase patterns, examine these files:

### Existing Policy System
- `packages/shared/domain/src/Policy.ts` - Current policy module
- `packages/shared/domain/src/_internal/policy.ts` - Permission generation
- `packages/shared/domain/src/_internal/policy-builder.ts` - Policy schema builder

### Better-Auth Configuration
- `packages/iam/infra/src/adapters/better-auth/Auth.service.ts` - Auth service setup
- `packages/iam/infra/src/adapters/better-auth/plugins/organization/organization.plugin.ts` - Organization plugin config

### Current Route/API Patterns
- `packages/iam/infra/src/api/api.ts` - Auth middleware implementation
- `packages/knowledge-management/infra/src/routes/KnowledgePage.router.ts` - Route handler pattern
- `packages/knowledge-management/domain/src/entities/KnowledgePage/KnowledgePage.contract.ts` - HttpApi contract

### Domain Model Examples
- `packages/knowledge-management/domain/src/entities/Document/Document.model.ts`
- `packages/knowledge-management/domain/src/entities/Discussion/Discussion.model.ts`

## Expected Output

Provide a structured review with:

1. **Executive Summary** - Overall assessment (approve/revise/reject) with key findings

2. **Strengths** - What the design does well

3. **Concerns** - Issues that need addressing, categorized by severity:
   - **Critical** - Must fix before implementation
   - **Major** - Should address, may cause significant issues
   - **Minor** - Nice to have improvements

4. **Questions** - Clarifications needed from the design author

5. **Alternative Approaches** - If applicable, suggest different solutions for problematic areas

6. **Recommendations** - Prioritized list of changes to make before implementation

## Review Guidelines

- Be specific - reference exact code snippets or sections from the design document
- Be constructive - provide solutions, not just criticism
- Consider the context - this is an Effect-first, multi-tenant SaaS starter kit
- Think about maintainability - will this scale as more entities are added?
- Consider the team - assume developers familiar with Effect but potentially new to better-auth

## Do NOT

- Implement any code changes
- Create new files (except this review)
- Make assumptions about undocumented behavior without noting them
- Skip examining the reference files - they provide crucial context