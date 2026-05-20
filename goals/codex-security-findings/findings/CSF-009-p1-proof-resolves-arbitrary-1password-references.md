# CSF-009: P1 proof resolves arbitrary 1Password references

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 073e7de |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | apps/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the live proof harness crossed the webview-to-native boundary and added secret resolution, but did not add an authorization/allowlist check before reading a user-controlled 1Password reference.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Installer security secret reads and validation are now gated by the approved install plan. Unapproved 1Password references are rejected before live secret reads, and validation reports a missing reference when the id, purpose, reference, or consumer does not match the approved plan.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx vitest run apps/stack-installer/test/P1ManualProof.test.ts`
- Changed files:
  - packages/installer/server/src/Layer.ts
  - apps/stack-installer/test/P1ManualProof.test.ts
- Verification notes:
  - The focused Vitest suite passes, including the regression that verifies unapproved references are rejected before any live secret read.

## Evidence Paths

- apps/stack-installer/src-tauri/src/lib.rs
- apps/stack-installer/src/App.tsx
- apps/stack-installer/src/proof/P1ManualProof.ts
- packages/drivers/discord/src/Discord.service.ts
- packages/installer/server/src/Layer.ts

## Validation Notes From Codex

- Confirm a webview-reachable native command was introduced and accepts attacker-controlled proof input.
- Confirm frontend/native validation only requires a generic 1Password reference shape, not the approved Discord token reference.
- Confirm the proof harness reads request.discordBotTokenReference directly as a secret.
- Confirm the security service has an approved plan but does not enforce it in readSecretReference before calling 1Password.
- Confirm the resolved value is consumed by outbound Discord API requests as an Authorization header.

## Sanitized Finding Content

```text
Finding
P1 proof resolves arbitrary 1Password references
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
073e7de
10:19 AM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the live proof harness crossed the webview-to-native boundary and added secret resolution, but did not add an authorization/allowlist check before reading a user-controlled 1Password reference.
The commit adds a live native command reachable from the Tauri webview. The frontend only checks that the submitted value has a 1Password-reference shape, then passes it to run_p1_manual_proof. The proof flow validates and reads request.discordBotTokenReference directly. The security service's readSecretReference implementation calls onePassword.read(reference) for the supplied reference and does not verify that it matches the approved Discord bot-token reference from the plan, nor does it require an explicit approval token or bind the reference to the requested purpose. The resolved value is then placed in the Discord Authorization header. A compromised renderer or injected script could therefore cause the native side to resolve arbitrary 1Password references available to the signed-in user, learn whether they resolve through proof success/failure, and transmit resolved values to Discord as Authorization headers or abuse a stored Discord bot token to post messages.
Validation
Confirm a webview-reachable native command was introduced and accepts attacker-controlled proof input.
Confirm frontend/native validation only requires a generic 1Password reference shape, not the approved Discord token reference.
Confirm the proof harness reads request.discordBotTokenReference directly as a secret.
Confirm the security service has an approved plan but does not enforce it in readSecretReference before calling 1Password.
Confirm the resolved value is consumed by outbound Discord API requests as an Authorization header.
Validation artifact
Evidence
apps/stack-installer/src-tauri/src/lib.rs
33
#[tauri::command]
34
fn run_p1_manual_proof(request: P1ManualProofRequest) -> Result<String, String> {
35
let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
36
let app_dir = manifest_dir
37
.parent()
38
.ok_or_else(|| "Unable to resolve Stack Installer app directory.".to_string())?;
39
let request_json = serde_json::to_string(&request)
40
.map_err(|_| "Unable to encode P1 proof request.".to_string())?;
41
let output = Command::new("bun")
42
.current_dir(app_dir)
43
.args(["run", "p1:proof", "--", "--request-json", &request_json])
44
.output()
45
.map_err(|_| "Unable to launch the app-local P1 proof harness.".to_string())?;
57
#[cfg_attr(mobile, tauri::mobile_entry_point)]
58
pub fn run() {
59
tauri::Builder::default()
60
.invoke_handler(tauri::generate_handler![stack_installer_health, run_p1_manual_proof])
61
.run(tauri::generate_context!())
apps/stack-installer/src/App.tsx
80
const submitProof = async (event: FormEvent<HTMLFormElement>, setProofState: (state: ProofState) => void) => {
81
event.preventDefault();
82
const formData = new FormData(event.currentTarget);
83
const discordBotTokenReference = valueFor(formData, "discordBotTokenReference");
84
85
if (!isOnePasswordReference(discordBotTokenReference)) {
86
setProofState({
87
_tag: "failed",
88
message: "Discord bot token must be a 1Password reference.",
89
});
90
return;
91
}
92
93
setProofState({ _tag: "running" });
94
95
try {
96
const output = await invoke<string>("run_p1_manual_proof", {
97
request: {
98
discordBotTokenReference,
99
discordChannelDisplayName: valueFor(formData, "discordChannelDisplayName"),
100
discordChannelId: valueFor(formData, "discordChannelId"),
101
discordGuildId: valueFor(formData, "discordGuildId"),
102
operatorLabel: valueFor(formData, "operatorLabel"),
103
targetPlatform: valueFor(formData, "targetPlatform"),
104
testMessageContent: valueFor(formData, "testMessageContent"),
105
},
106
});
apps/stack-installer/src/proof/P1ManualProof.ts
80
const secretValidation = yield* security.validateSecretReference(
81
new SecretReferenceValidationRequest({
82
id: "discord-bot-token",
83
purpose: "discord-bot-token",
84
reference: request.discordBotTokenReference,
85
usedBy: "installer-channels",
86
})
87
);
88
const botToken = yield* security.readSecretReference(request.discordBotTokenReference);
89
const providerValidations = yield* providers.validateProviderAuths();
90
const channel = new DiscordChannel({
91
botTokenReference: request.discordBotTokenReference,
92
channelId: request.discordChannelId,
93
displayName: request.discordChannelDisplayName,
94
guildId: request.discordGuildId,
95
id: "discord-ai-stack-installer",
96
kind: "guild-text-channel",
97
status: "unchecked",
98
});
99
const discordValidation = yield* channels.validateDiscordChannel(
100
new DiscordLiveValidationRequest({
101
channel,
102
testMessageContent: request.testMessageContent,
103
}),
104
botToken
105
);
packages/drivers/discord/src/Discord.service.ts
81
const authRequest = (
82
request: HttpClientRequest.HttpClientRequest,
83
botToken: Redacted.Redacted<string>
84
): HttpClientRequest.HttpClientRequest =>
85
pipe(
86
request,
87
HttpClientRequest.setHeader("Authorization", `Bot ${Redacted.value(botToken)}`),
88
HttpClientRequest.accept("application/json")
89
);
packages/installer/server/src/Layer.ts
62
export const makeInstallerSecurityServer = Effect.fn("InstallerSecurityServer.make")(function* () {
63
const plan = yield* decodeSecretReferencePlan(p1aSecretReferencePlanInput);
64
const onePassword = yield* OnePasswordCli;
65
66
return {
67
previewSecretReferences: () => Effect.succeed(plan),
68
readSecretReference: Effect.fn("InstallerSecurityServer.readSecretReference")(function* (reference) {
69
return yield* onePassword.read(reference).pipe(
70
Effect.mapError(
71
() =>
72
new SecretReferenceReadError({
73
message: "Unable to resolve approved 1Password reference.",
74
reference,
75
})
76
)
77
);
78
}),
Attack-path analysis
Kept at medium. Static evidence confirms the core authorization/allowlist bypass: webview-controlled input reaches op read without being checked against the approved plan, then flows into a Discord Authorization header. However, this is a local Tauri/operator workflow, not a public network endpoint; it requires a compromised or attacker-influenced renderer and a signed-in 1Password CLI session. The code also does not directly return the secret plaintext to the attacker, making high/critical inappropriate without an additional renderer injection or exfiltration primitive.
Path
Stack Installer React webview --invoke with attacker-selected discordBotTokenReference--> Tauri command run_p1_manual_proof --passes serialized request JSON to bun run p1:proof--> Bun P1 proof harness --calls readSecretReference(request.discordBotTokenReference)--> InstallerSecurity.readSecretReference --directly executes onePassword.read(reference) with no allowlist check--> 1Password CLI op read --resolved secret is used as botToken--> Discord REST driver
The finding is real: the webview collects discordBotTokenReference, only checks that it looks like an op:// reference, and invokes a native Tauri command. The command launches the P1 Bun harness with the caller-controlled JSON. The proof flow validates and then reads request.discordBotTokenReference directly. The security layer has an approved plan containing op://Private/Discord Bot/token, but readSecretReference does not enforce the plan and directly calls onePassword.read(reference), which runs op read on the supplied value. The resolved value is then used by the Discord driver in the Authorization: Bot header. This is a real local confused-deputy/authorization bypass, but medium is appropriate because exploitation requires a compromised or attacker-influenced local renderer and a signed-in 1Password session, and the code does not directly return the plaintext secret to the attacker.
Likelihood
Medium - The vulnerable sink is plainly reachable from the registered Tauri command, but it is not internet-facing. Exploitation requires renderer compromise, injected script, or user-assisted entry of an attacker-selected op:// reference, plus an authenticated 1Password CLI session.
Impact
Medium - A successful attacker can make the native process resolve arbitrary 1Password references accessible to the victim's CLI session and transmit the value to Discord as an Authorization header. The attacker can also learn whether a reference resolves through success/failure and can drive Discord actions when the selected reference is a valid bot token. Impact is limited because the plaintext is not directly returned to the renderer and exploitation is local/webview-mediated.
Assumptions
The Stack Installer Tauri app or P1 proof harness is used by an operator as intended, even though bundling is currently disabled and the package is private/version 0.0.0.
The operator has a signed-in 1Password CLI session with access to at least one sensitive op:// reference.
An attacker can influence the renderer-side input or execute script in the Tauri webview; without renderer compromise or user-assisted input, the native command is not remotely reachable.
Outbound HTTPS to Discord is permitted.
local Stack Installer/Tauri runtime or Bun proof harness is launched
renderer input or webview script execution is attacker-controlled
victim 1Password CLI session is authenticated and authorized for the referenced item
supplied value matches the broad op://vault/item/field reference shape
Controls
Tauri command is local to the desktop/webview boundary, not a public HTTP endpoint.
Renderer performs a syntactic 1Password reference check.
Effect schemas decode the proof request and 1Password reference shape.
Secret values are wrapped as Redacted and are not printed directly in the normal proof output.
Discord base URL defaults to https://discord.com/api/v10.
No strong authorization, allowlist, purpose binding, or approval token is enforced before op read.
Tauri CSP is null in the Stack Installer configuration.
Blindspots
Static-only review; the app and proof harness could not be dynamically built or run in this environment.
Actual distribution and operational use of apps/stack-installer is uncertain because the package is private, version 0.0.0, and Tauri bundle.active is false.
No independent proof of an XSS or remote content injection path in the Stack Installer renderer was established.
Actual 1Password CLI session behavior, vault access, and Discord API responses were not exercised.
Finding content copied
Finding content copied
```
