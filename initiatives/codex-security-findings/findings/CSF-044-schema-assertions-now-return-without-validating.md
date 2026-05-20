# CSF-044: Schema assertions now return without validating

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | b8bc609 |
| Reported age | 1h ago |
| Capture method | dom-fallback |
| Owner area | packages/foundation/modeling/utils |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced bug: validation assertions were converted from direct curried assertion functions to wrappers that never invoke the returned assertion function.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Effect v4 exposes S.asserts as a data-first assertion function, so the branch invokes S.asserts(schema, input) directly for non-empty array helpers while the JSDoc assertion path already uses the current API shape.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx --bun vitest run packages/foundation/modeling/utils/test/Array.test.ts && bunx tsc --noEmit --pretty false -p packages/foundation/modeling/utils/tsconfig.json && bunx tsc --noEmit --pretty false -p packages/tooling/library/repo-utils/tsconfig.json`
- Changed files:
  - packages/foundation/modeling/utils/src/Array.ts
- Verification notes:
  - The Array tests and package typechecks pass with data-first S.asserts calls.

## Evidence Paths

- packages/foundation/modeling/utils/src/Array.ts
- packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts
- repos/effect-v4/packages/effect/src/SchemaParser.ts

## Validation Notes From Codex

- Confirm the affected commit changed exported helpers from direct curried assertions to wrappers using S.asserts(schema, input).
- Confirm from Effect source that Schema.asserts returns an assertion function and does not validate until that returned function is invoked.
- Dynamically compare correct S.asserts(schema)(input) behavior against the real exported array helpers on invalid inputs.
- Demonstrate an invalid value accepted by the helper can reach invariant-dependent downstream code and crash.
- Assess the JSDoc helper for the same anti-pattern; dynamic import was blocked by missing deps, but source and Effect arity behavior validate the issue.

## Sanitized Finding Content

```text
Finding
Schema assertions now return without validating
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
b8bc609
8:06 PM May 19, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced bug: validation assertions were converted from direct curried assertion functions to wrappers that never invoke the returned assertion function.
Effect Schema.asserts returns an assertion function for a schema. The changed helpers now call S.asserts(schema, input) and discard the returned function instead of invoking it as S.asserts(schema)(input). At runtime this means assertNonEmptyArray, assertNonEmptyReadonlyArray, and assertJsDoc return successfully even for invalid inputs. If these exported helpers are used to enforce invariants, downstream code can receive empty arrays or malformed JSDoc definitions and may misbehave or crash. I did not find a current security boundary in this repository that depends on these helpers, so this is classified as a low-severity correctness/validation bug rather than a confirmed security vulnerability.
Validation
Confirm the affected commit changed exported helpers from direct curried assertions to wrappers using S.asserts(schema, input).
Confirm from Effect source that Schema.asserts returns an assertion function and does not validate until that returned function is invoked.
Dynamically compare correct S.asserts(schema)(input) behavior against the real exported array helpers on invalid inputs.
Demonstrate an invalid value accepted by the helper can reach invariant-dependent downstream code and crash.
Assess the JSDoc helper for the same anti-pattern; dynamic import was blocked by missing deps, but source and Effect arity behavior validate the issue.
Validation artifact
Evidence
packages/foundation/modeling/utils/src/Array.ts
66
export const assertNonEmptyArray: (input: unknown) => asserts input is A.NonEmptyArray<TUnsafe.Any> = (input) => {
67
S.asserts(NonEmptyArraySchema, input);
68
};
87
export const assertNonEmptyReadonlyArray: (input: unknown) => asserts input is A.NonEmptyReadonlyArray<TUnsafe.Any> = (
88
input
89
) => {
90
S.asserts(NonEmptyReadonlyArraySchema, input);
91
};
packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts
153
export const assertJsDoc: <const Def extends JSDocTagDefinition.Encoded>(input: Def) => asserts input is Def = (
154
input
155
) => {
156
S.asserts(S.toEncoded(JSDocTagDefinition), input);
157
};
repos/effect-v4/packages/effect/src/SchemaParser.ts
Schema.asserts returns an assertion function; callers must invoke that returned function with the input for validation to occur.
L119-130
Attack-path analysis
The original low classification correctly avoided high/critical treatment, but for security criticality this should be ignored rather than counted as a confirmed vulnerability. Probability is low because no in-scope public/runtime boundary was found invoking the helpers on attacker-controlled input. Impact is non-security because the validated effect is an invariant failure and possible TypeError/crash, not cross-boundary compromise. Evidence: Array.ts lines 66-91 and JSDocTagDefinition.model.ts lines 153-157 misuse a curried API; SchemaParser.ts lines 119-131 confirms the API shape; tests at Array.test.ts lines 27-30 show intended throw behavior. The packages are private/tooling-oriented, and no reachable attack path was identified.
Path
Hypothetical caller-controlled value --passed to exported helper--> assertNonEmptyArray/assertNonEmptyReadonlyArray/assertJsDoc --misuses curried API--> S.asserts(schema, input) returns validator but it is not invoked --validation silently skipped--> Malformed value reaches ordinary consumer logic --possible invariant-dependent crash--> Correctness failure or local crash only
The bug is real: the commit changed previously curried assertions into wrappers that call S.asserts(schema, input), while the local Effect implementation defines asserts(schema) as returning an assertion function. Therefore invalid inputs are accepted. The validation PoC demonstrated no-throw behavior and a downstream TypeError. However, static repository review did not find an in-scope attacker-reachable path from public web/desktop/network services to these helpers, and the demonstrated effect is an invariant/correctness failure rather than compromise of data, identity, code execution, tenant isolation, or secrets. @beep/utils and @beep/repo-utils are marked private in package manifests, and assertJsDoc is part of tooling. This should be fixed as a quality/runtime validation bug, but it should not be treated as a confirmed security vulnerability in this repository context.
Likelihood
Ignore - Exploitation would require a missing repository path where attacker-controlled input reaches these library assertions and then influences a security-sensitive sink. Exact usage search found no such path.
Impact
Ignore - The proven impact is acceptance of invalid values and possible local crash or misbehavior. No evidence shows sensitive data disclosure, auth bypass, tenant boundary break, command execution, arbitrary file access, or privilege escalation.
Assumptions
Assessment is limited to repository artifacts in /workspace/beep-effect and excludes .specs.
The relevant security question is whether a realistic in-scope attacker can reach these helpers through a product boundary, not whether the helpers are callable by arbitrary downstream code.
Validation evidence provided for the commit is accepted as evidence that the assertion helpers fail open at runtime.
An in-scope product route or service must pass attacker-controlled input to assertNonEmptyArray, assertNonEmptyReadonlyArray, assertJsDoc, or a wrapper such as mapNonEmpty.
Downstream code must rely on the missed non-empty-array or JSDoc invariant for a security-sensitive authorization, isolation, file, command, or data boundary.
The resulting malformed value must produce more than a local correctness failure or crash.
Controls
TypeScript non-empty-array types constrain normal typed callers but are erased at runtime.
No executable sink, filesystem sink, authorization decision, identity boundary, or network route was found using the affected helpers.
OPIP web CSP exists but is unrelated to this finding.
Affected packages are private workspace packages in repository manifests.
Blindspots
Static-only review cannot rule out future or external downstream consumers using these private packages in a security boundary.
Some earlier threat-model focus paths were not present in this checkout, so those services could not be mapped directly.
Repository grep excludes generated/history artifacts and .specs as requested.
Dependency installation/build was not performed during this attack-path pass; validation evidence from the prior stage supplied the executable PoC.
Finding content copied
Finding content copied
```
