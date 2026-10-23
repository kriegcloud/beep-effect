# S44 package-json ImportGraph cache review

Reviewer: Codex S44 md-tests (author review).

The RESUME 3 brief expands #2132 to package-json: replace its duplicated
runtime import resolver with `@beep/test-utils/ImportGraph`. The manifest adds
only the test-utils workspace devDependency. Scripts and cache qualification
are unchanged; generated TypeScript references follow that dependency.

Manifest: `packages/foundation/modeling/package-json/package.json`
- Before SHA-256: `11a505c7389526c2e86c4569ee290012d3211f1ce1eb6dbeea48cf64bcf1ebd6`
- After SHA-256: `f4940e16d1503a77bc8ce19e7d1cbf61900c96b25ed6159b0a76278b3e991e3f`

The full cache audit reports precisely four configuration-drift tasks:
`@beep/package-json#build`, `@beep/package-json#check`,
`@beep/package-json#lint:deprecated-apis` and `@beep/package-json#test`.
Each fingerprint changes because the same manifest gains this development
edge. Re-record only package-json; retain scope, profile, epoch and all
qualification. This registers a changed input, without suppressing a finding.

Reverse by reverting the helper adoption, development dependency, generated
references and this cache registration together.
