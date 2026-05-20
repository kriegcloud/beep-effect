# CSF-024: Sanity projectId can redirect API requests

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | e14cb54 |
| Reported age | 4d ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/sanity/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a URL authority injection bug in the Sanity driver. The code should validate projectId against Sanity's allowed project ID format before using it as a DNS label, or construct the URL with a safe host-label encoder and reject characters such as '/', '?', '#', '@', ':', '[', and ']'.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Sanity configuration now schema-validates projectId, dataset, and API version before constructing client URLs, preventing slash or URL delimiter injection through projectId.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx vitest run packages/drivers/sanity/test/Sanity.service.test.ts`
- Changed files:
  - packages/drivers/sanity/src/Sanity.config.ts
- Verification notes:
  - The focused Sanity service test suite passes after the schema constraint change.

## Evidence Paths

- packages/drivers/sanity/src/Sanity.config.ts
- packages/drivers/sanity/src/Sanity.service.ts

## Validation Notes From Codex

- Confirm projectId is accepted as an unconstrained string in the public config schema.
- Confirm resolveConfig carries projectId forward without validation, encoding, or rejection of URL delimiters.
- Confirm the introduced project-scoped host construction interpolates raw projectId into the URL authority for default Sanity hosts.
- Confirm the generated URL is used directly for the outbound POST and the bearer token is attached to that same request.
- Demonstrate with a minimal PoC that a delimiter-bearing projectId changes the parsed host to attacker-controlled infrastructure and that the Authorization header is received there.

## Sanitized Finding Content

```text
Finding
Sanity projectId can redirect API requests
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
e14cb54
2:19 AM May 15, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a URL authority injection bug in the Sanity driver. The code should validate projectId against Sanity's allowed project ID format before using it as a DNS label, or construct the URL with a safe host-label encoder and reject characters such as '/', '?', '#', '@', ':', '[', and ']'.
The new project-scoped Sanity host construction uses `${config.projectId}` directly inside `https://${config.projectId}.api.sanity.io`. Because `projectId` is only typed as an arbitrary string and is not validated or URL-encoded, values such as `attacker.example/x` produce `https://attacker.example/x.api.sanity.io/...`, whose host is `attacker.example`, not a Sanity subdomain. The same request path then receives the configured Authorization bearer token. This creates an SSRF and credential-exfiltration risk if any deployment or caller allows tenant/user-controlled Sanity project IDs while using the default Sanity API hosts.
Validation
Confirm projectId is accepted as an unconstrained string in the public config schema.
Confirm resolveConfig carries projectId forward without validation, encoding, or rejection of URL delimiters.
Confirm the introduced project-scoped host construction interpolates raw projectId into the URL authority for default Sanity hosts.
Confirm the generated URL is used directly for the outbound POST and the bearer token is attached to that same request.
Demonstrate with a minimal PoC that a delimiter-bearing projectId changes the parsed host to attacker-controlled infrastructure and that the Authorization header is received there.
Validation artifact
Evidence
packages/drivers/sanity/src/Sanity.config.ts
47
export class SanityConfigInput extends S.Class<SanityConfigInput>($I`SanityConfigInput`)(
48
{
49
apiHost: S.optionalKey(S.String),
50
apiToken: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
51
apiVersion: S.optionalKey(S.String),
52
dataset: S.optionalKey(S.String),
53
headers: S.optionalKey(S.Record(S.String, S.String)),
54
projectId: S.optionalKey(S.String),
packages/drivers/sanity/src/Sanity.service.ts
168
const projectId = yield* pipe(
169
O.fromNullishOr(input.projectId),
170
O.match({
171
onNone: () => Effect.fail(SanityError.fromReason("config")),
172
onSome: Effect.succeed,
173
})
174
);
175
const dataset = yield* pipe(
176
O.fromNullishOr(input.dataset),
177
O.match({
178
onNone: () => Effect.fail(SanityError.fromReason("config")),
179
onSome: Effect.succeed,
180
})
181
);
182
183
return new ResolvedSanityConfig({
184
apiHost: normalizeBaseUrl(input.apiHost ?? "https://api.sanity.io"),
185
apiToken: O.fromUndefinedOr(input.apiToken),
186
apiVersion: input.apiVersion ?? SANITY_API_VERSION,
187
dataset,
188
headers: input.headers ?? {},
189
projectId,
190
});
193
const queryUrl = (config: ResolvedSanityConfig): string =>
194
`${projectScopedApiHost(config)}/v${config.apiVersion}/data/query/${config.dataset}`;
195
196
const projectScopedApiHost = (config: ResolvedSanityConfig): string => {
197
if (config.apiHost === "https://api.sanity.io") {
198
return `https://${config.projectId}.api.sanity.io`;
199
}
200
201
if (config.apiHost === "https://apicdn.sanity.io") {
202
return `https://${config.projectId}.apicdn.sanity.io`;
203
}
204
205
return config.apiHost;
212
pipe(request, HttpClientRequest.accept("application/json"), HttpClientRequest.setHeaders(config.headers), (current) =>
213
pipe(
214
config.apiToken,
215
O.match({
216
onNone: () => current,
217
onSome: (token: RedactedType.Redacted<string>) => HttpClientRequest.bearerToken(current, token),
218
})
230
const url = queryUrl(config);
231
232
return yield* pipe(
233
HttpClientRequest.post(url),
234
(base) => addHeaders(base, config),
235
(base) => HttpClientRequest.bodyJson(base, { query: decoded.query, params: decoded.params ?? {} }),
Attack-path analysis
Downgraded from high to low for the repository context. The URL-authority injection and bearer-token forwarding are real and validated in the driver, but high severity requires attacker control of the requested URL from an in-scope attack surface. Static review found OPIP passes SANITY_PROJECT_ID from server-side configuration (apps/opip-web/src/content/OpipContent.runtime.ts:87-101) and infrastructure provisions it from Pulumi/Vercel environment settings (infra/src/OpipWeb.ts:762-787). Public routes can trigger loading (apps/opip-web/src/app/page.tsx:102-106; apps/opip-web/src/app/llms.txt/route.ts:24-25), but they do not choose projectId. Therefore exploitation depends on a non-evidenced consumer misuse or operator-controlled malicious/malformed configuration. Impact remains high if that precondition is met, but likelihood in the reviewed product is low.
Path
Remote user requests OPIP page or /llms.txt --route loads content--> getOpipSiteContent reads server SANITY_* environment --env values create config--> SanityConfigInput accepts arbitrary projectId string --no validation or hostname-label encoding--> projectScopedApiHost builds https://${projectId}.api.sanity.io --constructed URL used for POST--> Sanity.fetch POST sends bearer token to constructed URL --bearer token forwarded to parsed host--> Attacker-controlled host receives token only if projectId was attacker-influenced
The underlying bug is real: SanityConfigInput declares projectId as an unconstrained string, resolveConfig carries it forward unchanged, projectScopedApiHost interpolates it directly into the URL authority for default Sanity hosts, and addHeaders attaches the configured bearer token to the resulting POST. A delimiter-bearing projectId can therefore alter the parsed host and receive the Authorization header, as shown by the validation PoC. The high rating is not supported for the reviewed application context because OPIP obtains projectId from SANITY_PROJECT_ID/Pulumi configuration, not from public request input or a tenant-controlled field. Public OPIP routes can trigger the request, but static evidence does not show a public attacker can choose the project id. This is a real security bug in the reusable driver with high impact if misused, but current in-repo reachability is low.
Likelihood
Low - The vulnerable code is reachable during normal Sanity fetches, and public OPIP routes can trigger content loading, but the key exploit input, projectId, is sourced from server environment/Pulumi configuration in the reviewed app. No in-repo public API, tenant header, or request parameter was found that controls it.
Impact
High - If an attacker can influence projectId, the server can be induced to send the configured Sanity bearer token to an attacker-controlled or internal HTTPS host. That is meaningful credential disclosure and SSRF-style network reachability. The exact token privilege is not visible in repository artifacts.
Assumptions
Static review is limited to repository artifacts; no cloud APIs or deployed runtime configuration were queried.
The OPIP web deployment may be public because the Vercel authentication deployment type defaults to none, but the Sanity project id shown in this repository is sourced from environment/Pulumi configuration rather than from a public request.
The validation-stage PoC accurately mirrors the vulnerable URL construction and token attachment behavior, but it does not prove an in-repository public route lets an attacker choose SANITY_PROJECT_ID.
A caller or deployment path must allow an attacker to influence SanityConfigInput.projectId or SANITY_PROJECT_ID.
The Sanity driver must use the default apiHost value of https://api.sanity.io or https://apicdn.sanity.io.
A SANITY_API_TOKEN or apiToken must be configured for credential exfiltration impact.
An application request or scheduled execution must trigger Sanity.fetch.
Controls
SANITY_API_TOKEN is marked sensitive in Vercel environment variable provisioning.
OPIP content loader falls back to static content on provider errors and logs sanitized metadata.
Project id is operator/Pulumi/environment-controlled in the reviewed OPIP app path.
No projectId hostname-label validation or final-host allowlist exists in the Sanity driver.
Blindspots
Static-only review cannot prove how deployed SANITY_PROJECT_ID is populated outside Pulumi configuration or whether an external admin system can modify it.
The exact scope and permissions of SANITY_API_TOKEN are not present in repository artifacts.
No cloud APIs were queried, so actual Vercel exposure and runtime environment values were not verified.
The monorepo may contain downstream consumers of @beep/sanity not covered by the searched OPIP path, though grep did not find another obvious runtime use outside tests/tooling.
Finding content copied
Finding content copied
```
