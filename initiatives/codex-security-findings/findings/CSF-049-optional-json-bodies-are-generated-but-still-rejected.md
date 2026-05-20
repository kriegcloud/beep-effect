# CSF-049: Optional JSON bodies are generated but still rejected

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 342c52d |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/runpod/scripts |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a functional bug in generated clients for OpenAPI operations with optional JSON request bodies: the generated request type permits omission, while the runtime still rejects omission.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/drivers/runpod/scripts/generate.ts
- packages/drivers/runpod/src/Runpod.service.ts

## Validation Notes From Codex

- Confirm the generator reads OpenAPI requestBody.required and can mark JSON body fields optional.
- Confirm generated operation request optionality is derived from required request fields, so an operation with only an optional body can expose request?: Request.
- Confirm generated operation descriptors record only requestBody: "json"/"none" and do not preserve whether the body is required.
- Confirm runtime request encoding rejects a JSON-body descriptor when decodedRequest lacks a body property.
- Reproduce the mismatch with a minimal OpenAPI document and verify the checked-in OpenAPI has no currently exposed optional JSON body operations.

## Sanitized Finding Content

```text
Finding
Optional JSON bodies are generated but still rejected
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
342c52d
6:36 PM May 12, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a functional bug in generated clients for OpenAPI operations with optional JSON request bodies: the generated request type permits omission, while the runtime still rejects omission.
The generator now marks the generated `body` request field as optional unless the OpenAPI request body is explicitly `required: true`. However, operation descriptors still only record whether a JSON body exists, not whether it is required. At runtime, `addJsonBody` checks only `descriptor.requestBody === "json"` and fails request encoding if the decoded request does not contain a `body` property. For any operation with an optional JSON request body, the generated TypeScript schema would accept an omitted body, and the generated operation shape may even make the whole request optional, but execution would fail before sending the request. The checked-in Runpod OpenAPI document currently has all JSON request bodies marked required, so this is a latent generator/runtime consistency bug rather than an immediately exposed vulnerability.
Validation
Confirm the generator reads OpenAPI requestBody.required and can mark JSON body fields optional.
Confirm generated operation request optionality is derived from required request fields, so an operation with only an optional body can expose request?: Request.
Confirm generated operation descriptors record only requestBody: "json"/"none" and do not preserve whether the body is required.
Confirm runtime request encoding rejects a JSON-body descriptor when decodedRequest lacks a body property.
Reproduce the mismatch with a minimal OpenAPI document and verify the checked-in OpenAPI has no currently exposed optional JSON body operations.
Validation artifact
Evidence
packages/drivers/runpod/scripts/generate.ts
159
const parameters = mergeParameters(pathItem.parameters ?? [], operation.parameters ?? []);
160
const bodySchema = operation.requestBody?.content?.["application/json"]?.schema;
161
const requestFields = renderRequestFields(parameters, bodySchema, operation.requestBody?.required === true);
162
const response = chooseResponse(operation.responses ?? {});
244
if (bodySchema !== undefined) {
245
fields.push({
246
name: "body",
247
required: bodyRequired,
248
schemaExpression: schemaExpression(bodySchema, "body"),
640
requestBody: ${
641
pipe(
642
operation.requestFields,
643
A.some((field) => field.name === "body")
644
)
645
? '"json"'
646
: '"none"'
647
},
packages/drivers/runpod/src/Runpod.service.ts
296
const addJsonBody = (
297
descriptor: G.RunpodOperationDescriptor,
298
request: HttpClientRequest.HttpClientRequest,
299
decodedRequest: unknown
300
): Effect.Effect<HttpClientRequest.HttpClientRequest, RunpodError> => {
301
if (descriptor.requestBody === "none") {
302
return Effect.succeed(request);
303
}
304
305
return pipe(
306
readProperty(decodedRequest, "body"),
307
O.match({
308
onNone: () => Effect.fail(RunpodError.fromDescriptor(descriptor, "request encoding")),
309
onSome: (body) =>
310
pipe(
311
HttpClientRequest.bodyJson(request, body),
312
Effect.mapError((cause) => RunpodError.fromDescriptor(descriptor, "request encoding", { cause }))
313
),
314
})
315
);
Attack-path analysis
The original low classification is conservative for a real functional bug, but for security triage this should be ignored. The evidence supports a generator/runtime mismatch, not a vulnerability: the affected @beep/runpod code is a client driver/codegen path rather than an exposed service; the current OpenAPI has 0 optional JSON bodies; exploitation requires a future optional-body spec and a caller omitting body; and the result is only a pre-network request encoding error. There is no realistic attacker path, no cross-boundary impact, no authz/authn bypass, no code execution, no data or secret exposure, and no meaningful service-level DoS.
Path
Future/synthetic OpenAPI operation has optional application/json requestBody --requestBody.required !== true makes generated field optional--> generate.ts emits optional body field and possibly optional request parameter --descriptor loses required/optional distinction--> Operation descriptor records only requestBody: "json" --runtime sees descriptor.requestBody === "json"--> Runpod.service.ts addJsonBody reads missing body as None --missing body causes RunpodError during request encoding--> Client receives request encoding error before network I/O
The finding is a valid functional bug but not a demonstrated security vulnerability. Static evidence confirms the generator passes operation.requestBody?.required === true into request field rendering, so JSON bodies without required:true become optional in generated schemas. Operation requiredness is then derived only from required request fields, allowing a request parameter to become optional. However, generated descriptors record only requestBody: "json" or "none" and do not retain whether the JSON body is optional. At runtime, addJsonBody rejects any json-body descriptor when decodedRequest.body is missing or undefined. The checked-in Runpod OpenAPI currently has 13 JSON request bodies and 0 optional JSON request bodies, so the bug is latent for current generated clients. The path causes client-side request encoding failure before network I/O and provides no attacker-controlled route to code execution, auth bypass, data disclosure, tenant crossing, or secret exposure.
Likelihood
Ignore - There is no in-scope attacker-controlled network entry point. Current checked-in OpenAPI data does not contain optional JSON request bodies, so the bug is not active for current generated operations. Triggering it requires future/spec-controlled input and legitimate client usage.
Impact
Ignore - Impact is limited to a local generated client rejecting a request that its own generated type/schema allows. This can cause a request to fail for the caller, but it does not compromise confidentiality, integrity, identity, service privileges, secrets, or external availability of a deployed service.
Assumptions
Analysis is limited to repository artifacts in /workspace/beep-effect and excludes .specs as requested.
No cloud APIs or external Runpod services were queried.
The checked-in OpenAPI document represents the currently generated Runpod client surface in this checkout.
A future OpenAPI document controlled by developers or upstream API specification changes could introduce optional JSON request bodies, but that is not an attacker-controlled input in the stated threat model.
A Runpod OpenAPI operation with application/json requestBody but without required:true
The generator is run against that future or synthetic OpenAPI document
A legitimate caller invokes the generated client operation while omitting body
The generated descriptor still records requestBody as only json rather than preserving optionality
Controls
Current checked-in Runpod OpenAPI has no optional JSON request bodies, based on static count of 13 JSON request bodies and 0 optional JSON request bodies.
No repository IaC, ingress, load balancer, or port binding exposes this code path as a network service.
The affected runtime path fails before sending the HTTP request, limiting impact to the local caller's operation.
Runpod API keys are modeled as redacted configuration values; this finding does not expose secret values.
No executable sink, command execution, file access, auth bypass, or tenant-boundary logic is involved in the affected code path.
Blindspots
Static-only review did not run the full package test suite because dependency installation/build execution was not part of this attack-path pass.
Future OpenAPI documents or downstream generated artifacts outside this checkout could activate the functional bug.
No deployment manifests for @beep/runpod were identified in the inspected artifacts, so exposure assessment is based on repository code/package metadata.
If another service wraps this driver and exposes optional-body calls to untrusted users in the future, that wrapper would need separate assessment.
Finding content copied
Finding content copied
```
