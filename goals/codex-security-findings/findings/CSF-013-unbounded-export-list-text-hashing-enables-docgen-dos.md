# CSF-013: Unbounded export-list text hashing enables docgen DoS

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | f15eec8 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: local export-list evidence is now copied into every candidate and included in each subject hash without length bounds. The previous direct declaration hashing used bounded declaration text and did not add full local export declaration text per symbol.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Docgen quality export-list hashing no longer hashes unbounded declaration text. The branch derives candidate identity from the first line of each declaration and bounds that text before hashing.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/tool/cli/test/docgen.test.ts --test-name-pattern "quality|category"`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Docgen/internal/Quality.ts
  - packages/tooling/tool/cli/test/docgen.test.ts
- Verification notes:
  - The docgen quality/category focused tests pass after the bounded-hash change.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Docgen/internal/Quality.ts

## Validation Notes From Codex

- Confirm the commit introduced a local export-list path that creates one candidate per named export and attaches unbounded exportDeclaration.getText() to each candidate.
- Confirm each candidate hash input includes the full export-list text and the finalization path fully encodes/hashes that string for every subject.
- Demonstrate an attacker-controlled source shape: one leading-JSDoc local export list with many names creates N subjects and aggregate hash input proportional to N times the export-list length.
- Produce dynamic evidence of resource exhaustion/crash and a fixed-mode control showing the export-list text is the cause.
- Attempt required dynamic tooling: actual CLI attempted but dependency installation failed, valgrind attempted but unavailable, and LLDB debugger trace captured the OOM path.

## Sanitized Finding Content

```text
Finding
Unbounded export-list text hashing enables docgen DoS
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
f15eec8
11:40 PM May 8, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: local export-list evidence is now copied into every candidate and included in each subject hash without length bounds. The previous direct declaration hashing used bounded declaration text and did not add full local export declaration text per symbol.
For local export lists with a leading JSDoc block, the new code iterates over every named export and attaches `exportDeclaration.getText()` to each candidate without bounding or sharing it. Later, each candidate includes that full export-list text in `hashSourceText`, which is hashed by encoding the complete string. A malicious repository can create a single very large `/** ... */ export { a1, a2, ..., aN }` declaration; the same large declaration text is duplicated and re-hashed for every specifier. This can drive O(N^2)-style memory allocation and CPU work in `beep docgen quality`, crashing or hanging CI/developer tooling that analyzes attacker-controlled source.
Validation
Confirm the commit introduced a local export-list path that creates one candidate per named export and attaches unbounded exportDeclaration.getText() to each candidate.
Confirm each candidate hash input includes the full export-list text and the finalization path fully encodes/hashes that string for every subject.
Demonstrate an attacker-controlled source shape: one leading-JSDoc local export list with many names creates N subjects and aggregate hash input proportional to N times the export-list length.
Produce dynamic evidence of resource exhaustion/crash and a fixed-mode control showing the export-list text is the cause.
Attempt required dynamic tooling: actual CLI attempted but dependency installation failed, valgrind attempted but unavailable, and LLDB debugger trace captured the OOM path.
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Docgen/internal/Quality.ts
734
for (const exportDeclaration of sourceFile.getExportDeclarations()) {
735
if (exportDeclaration.getModuleSpecifierValue() !== undefined) {
736
continue;
737
}
738
739
const rawJsDoc = getLeadingJsDocCommentText(exportDeclaration);
740
if (Str.trim(rawJsDoc).length === 0) {
741
continue;
742
}
743
744
for (const specifier of exportDeclaration.getNamedExports()) {
745
const exportName = specifier.getAliasNode()?.getText() ?? specifier.getName();
746
const declarations =
747
exportedDeclarations.get(exportName) ?? exportedDeclarations.get(specifier.getName()) ?? A.empty();
748
749
for (const declaration of declarations) {
750
if (declaration.getSourceFile() !== sourceFile) {
751
continue;
752
}
753
754
candidates = A.append(candidates, {
755
name: exportName,
756
declaration,
757
anchorNode: exportDeclaration,
758
rawJsDoc,
759
exportDeclarationText: exportDeclaration.getText(),
760
});
1084
for (const candidate of collectExportedDeclarationCandidates(sourceFile)) {
1085
const { declaration, name: exportName } = candidate;
1086
const rawJsDoc = candidate.rawJsDoc ?? getLastJsDocText(declaration);
1087
const line = nodeLine(candidate.anchorNode ?? declaration);
1088
const declarationSource = declarationText(declaration);
1089
1090
subjects = A.append(
1091
subjects,
1092
makeSubjectCandidate({
1093
declarationKind: getExportKind(declaration),
1094
declarationSource,
1095
diagnostics,
1096
endLine: sourceFile.getLineAndColumnAtPos(declaration.getEnd()).line,
1097
exportName,
1098
filePath,
1099
generatedDocSnippet,
1100
hashSourceText: `${rawJsDoc}\n${declarationSource}\n${candidate.exportDeclarationText ?? ""}`,
1101
line,
1133
const finalizeSubject = Effect.fn("DocgenQuality.finalizeSubject")(function* (
1134
candidate: DocgenQualitySubjectCandidate
1135
) {
1136
const contentHash = yield* decodeContentHashFromSourceText(candidate.hashSourceText).pipe(
1137
Effect.mapError((cause) => new DomainError({ message: "Failed to compute JSDoc quality subject hash.", cause }))
1138
);
1139
const { hashSourceText: _hashSourceText, identityStem, ...subject } = candidate;
1140
void _hashSourceText;
1141
return new DocgenQualitySubject({
1142
...subject,
1143
stableIdentity: `${identityStem}:${contentHash.slice(0, 12)}`,
1144
contentHash,
Attack-path analysis
Keeping medium. The code evidence and executable validation support a real uncontrolled-resource-consumption vulnerability: one crafted export list can cause duplicated, unbounded hash inputs and repeated full string encoding/hashing. The attack is in scope for repository-content/developer-tool DoS, but it is not a high/critical issue because reachability is local/build-time only, requires the victim to run `beep docgen quality` on attacker-controlled source, and the proven impact is limited to a single CLI/CI process availability failure with no confidentiality, integrity, identity, or cross-boundary compromise.
Path
Attacker-controlled TypeScript source --victim analyzes repo content--> Documented `bun run beep docgen quality` invocation --parses package source files--> collectExportedDeclarationCandidates per-specifier candidate creation --adds full export declaration text per candidate--> Unbounded exportDeclaration.getText copied into hashSourceText --hashes large duplicated string repeatedly--> TextEncoder/SHA-256 processes full input for every subject --CPU/memory exhaustion--> CLI/CI availability loss
The finding is a real availability bug in the documented repo CLI quality command. Static evidence shows local export declarations with leading JSDoc are iterated per named export, and the full unbounded declaration text is stored on each candidate. Later, each candidate's `hashSourceText` concatenates that full export-list text and finalization hashes every candidate, with the hash path fully encoding the string. The ordinary declaration text is bounded to 2,000 characters, but this new export-list text is not. Validation evidence describes an executable harness that reproduced heap exhaustion for a 5,000-name export list, while a control omitting the export-list text completed. Severity remains medium because the impact is limited to availability of a local/CI developer-tool process and requires the victim to run a non-network-exposed command on attacker-controlled source; no code execution, data disclosure, privilege escalation, or cross-tenant impact is evidenced.
Likelihood
Low - The malformed input is easy to create and is attacker-controlled when analyzing untrusted repository contents or pull requests, and the command is documented. However, the command is not publicly exposed over a network and does not appear to be part of the default GitHub docgen lane, so exploitation requires the victim to run this specific developer tool on the malicious source.
Impact
Medium - Successful exploitation can crash or hang a developer or CI quality-analysis process through CPU and memory exhaustion. The validation evidence demonstrates heap OOM under constrained memory. The impact is availability-only and does not demonstrate RCE, file read, secret exposure, identity compromise, or persistent service outage.
Assumptions
A realistic attacker can contribute or supply TypeScript repository content that a maintainer, developer, or CI job analyzes with the documented `beep docgen quality` command.
The affected command runs in a developer or CI environment with ordinary process CPU and memory limits, not as an internet-facing service.
The repository checkout is read-only for this analysis; no cloud APIs or live services were queried.
Attacker controls a TypeScript source file in a package selected by `beep docgen quality`.
The source includes a local export declaration with leading JSDoc and a very large named export list.
A victim developer or CI process runs `bun run beep docgen quality`, `--changed-files`, `--all`, or `-p <package>` against that content.
Controls
Affected code is a local/private workspace CLI command, not a network listener.
No cloud IAM, service account, load balancer, or exposed port is involved in the vulnerable path.
Command target selection requires package/all/changed-files scope resolution.
Some adjacent text fields are bounded, but the vulnerable `exportDeclarationText` field is not.
Default observed GitHub docgen workflow does not explicitly invoke `docgen quality`, so exploitation depends on a developer or separate CI job running that command.
Blindspots
Static review did not execute the full Bun CLI in this environment because dependency installation/runtime availability was not part of this attack-path pass.
The repository may have additional private CI jobs or external automation invoking `docgen quality` that are not visible in the checkout.
Exact resource thresholds on real developer or CI machines depend on memory limits and the maximum accepted repository/file size.
No cloud deployment, package registry usage, or downstream consumer telemetry was queried.
Finding content copied
Finding content copied
```
