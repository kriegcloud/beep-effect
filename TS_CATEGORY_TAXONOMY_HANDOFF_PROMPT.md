# TS Category Taxonomy Fibration Implementation Prompt

You are finishing TS category taxonomy implementation in beep-effect3.

## Goal
Implement the TS category taxonomy fibration in repo-utils so it mirrors the existing JSDoc tag fibration pattern and drives TypeDoc `@category` values via a strict literal union schema.

## Read First
1) `tooling/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts`  
2) `tooling/repo-utils/src/JSDoc/models/JSDocTagAnnotation.model.ts`  
3) `tooling/repo-utils/src/JSDoc/JSDoc.ts` (how `make()` is consumed)  
4) `specs/pending/repo-codegraph-jsdoc/outputs/jsdoc-exhaustiveness-audit/ts-category-taxonomy.ts`  
5) `tooling/repo-utils/src/JSDoc/models/TSCategory.model.ts`  
6) `tooling/repo-utils/src/JSDoc/models/tag-values/TypeDocTagValues.ts`

## Locked Decisions (Do Not Re-decide)
1. Full spec runtime scope from `ts-category-taxonomy.ts`.
2. Keep `CategoryValue` field name as `name`.
3. Implement real fibration `make()` in `TSCategory.model.ts` (validate full metadata, then project to lean schema + metadata annotation).

## Files To Edit
1) `tooling/repo-utils/src/JSDoc/models/TSCategory.model.ts`  
2) `tooling/repo-utils/src/JSDoc/models/tag-values/TypeDocTagValues.ts`  
3) `tooling/repo-utils/src/JSDoc/models/index.ts`  
4) `tooling/repo-utils/test/JSDocTagFibration.test.ts` and/or new `tooling/repo-utils/test/TSCategoryFibration.test.ts`

## Implementation Requirements
1. In `TSCategory.model.ts`, keep `TSCategoryDefinition` as the metadata validation schema.
2. Add taxonomy/category literal schema representing exactly:
   - `DomainModel`
   - `DomainLogic`
   - `PortContract`
   - `Validation`
   - `Utility`
   - `UseCase`
   - `Presentation`
   - `DataAccess`
   - `Integration`
   - `Configuration`
   - `CrossCutting`
   - `Uncategorized`
3. Add fibrational `make()` that:
   - accepts `_tag` + metadata payload (without `_tag`),
   - validates via `TSCategoryDefinition` decode,
   - returns lean schema suitable for category value usage,
   - attaches validated metadata on a typed annotation key (TS-category equivalent of `jsDocTagMetadata`).
4. Export helper to retrieve TS category metadata annotation from a schema.
5. Port full runtime constants/utilities from spec:
   - `DETERMINISTIC_CLASSIFICATION_THRESHOLD`
   - `UNCATEGORIZED_GUARDRAIL_THRESHOLD`
   - `TESTING_FILE_PATTERNS`
   - `TESTING_IMPORT_PATTERNS`
   - `CATEGORY_TAXONOMY`
   - `CategoryTag` type
   - `CATEGORY_PRECEDENCE`
   - `CONTEXT_FALLBACK_POLICY`
   - `APPLICABLE_TO_CATEGORY_ROUTING`
   - `getCategoryPrecedence`
   - `getCategory`
   - `getCategoriesByPurity`
   - `getCategoriesByArchLayer`
   - `getCategoriesByEffectAnalog`
   - `getCategoriesForApplicableTo`
   - `getCandidateCategories`
   - `resolveContextFallback`
6. In `TypeDocTagValues.ts`, update `CategoryValue` to:
   - keep `_tag: "category"`,
   - keep field key `name`,
   - change field schema from `String` to TS category literal union schema from `TSCategory.model.ts`.
7. Update `models/index.ts` exports so TS category APIs are publicly available.
8. Keep Effect-first/lawful style:
   - canonical aliases (`A`, `O`, `P`, `R`, `S`) where needed,
   - no `any` / type assertions / `ts-ignore` / non-null assertions,
   - avoid native mutable container helpers in domain logic.

## Tests To Add/Update
1. Category schema accepts valid tags and rejects invalid ones.
2. TSCategory `make()` attaches metadata annotation and returns lean schema.
3. `CATEGORY_TAXONOMY` entries decode as `TSCategoryDefinition` and include all 12 tags.
4. `CategoryValue` decode succeeds for valid names and fails for invalid names.
5. Runtime helper behavior and ordering/scoring logic are covered.
6. Existing JSDoc tag fibration tests remain passing.

## Verification Commands
1. `bunx turbo run check --filter=@beep/repo-utils`
2. `bunx turbo run lint --filter=@beep/repo-utils`
3. `bunx turbo run test --filter=@beep/repo-utils`
4. `bunx turbo run docgen --filter=@beep/repo-utils`

## Output Expectations
1. Show concise diff summary by file.
2. Report any intentional deviations from spec and why.
3. Include test command results and failures fixed.
