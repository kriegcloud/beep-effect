# CSF-017: Unbounded ACP queues allow peer-driven memory exhaustion

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 2ccabc0 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/acp/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the new ACP protocol/client implementation uses unbounded queues and pending notification arrays for attacker-controlled peer traffic without enforcing limits or backpressure.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: ACP protocol and client notification queues now have finite capacities. Peer-driven protocol queues use bounded queues, disconnect queues have a smaller bound, and pre-session notification buffers drop oldest entries once their cap is reached.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx vitest run packages/drivers/acp/test/protocol.test.ts packages/drivers/acp/test/integration/client.integration.test.ts`
- Changed files:
  - packages/drivers/acp/src/client.ts
  - packages/drivers/acp/src/protocol.ts
- Verification notes:
  - The ACP protocol and client integration test suites pass.

## Evidence Paths

- packages/drivers/acp/src/client.ts
- packages/drivers/acp/src/protocol.ts

## Validation Notes From Codex

- Confirm the introduced ACP protocol allocates unbounded queues for peer-controlled inbound/outbound/notification paths.
- Confirm incoming stdin data is decoded and routed continuously without message-size, rate, queue-capacity, or backpressure checks.
- Confirm every decoded notification is offered to an unbounded notification queue before application-level consumption.
- Confirm the ACP client buffers SessionUpdate and ElicitationComplete notifications in uncapped arrays when handlers are absent.
- Obtain dynamic evidence that repeated valid notification traffic can grow retained memory until process failure, or document why direct execution is blocked.

## Sanitized Finding Content

```text
Finding
Unbounded ACP queues allow peer-driven memory exhaustion
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
2ccabc0
12:46 AM May 6, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the new ACP protocol/client implementation uses unbounded queues and pending notification arrays for attacker-controlled peer traffic without enforcing limits or backpressure.
The ACP driver introduced by this commit creates unbounded queues for server messages, client messages, notifications, disconnects, and outgoing data. Incoming stdin data is decoded and routed continuously, and notifications are always offered to an unbounded notification queue. The client layer also stores session/update and elicitation-complete notifications in unbounded in-memory arrays when handlers have not yet been registered. There is no message-size limit, queue capacity, notification buffer cap, or backpressure/drop policy. An untrusted ACP peer connected over this transport can repeatedly send valid notifications or protocol messages faster than the application consumes them, causing process memory growth and eventual denial of service.
Validation
Confirm the introduced ACP protocol allocates unbounded queues for peer-controlled inbound/outbound/notification paths.
Confirm incoming stdin data is decoded and routed continuously without message-size, rate, queue-capacity, or backpressure checks.
Confirm every decoded notification is offered to an unbounded notification queue before application-level consumption.
Confirm the ACP client buffers SessionUpdate and ElicitationComplete notifications in uncapped arrays when handlers are absent.
Obtain dynamic evidence that repeated valid notification traffic can grow retained memory until process failure, or document why direct execution is blocked.
Validation artifact
Evidence
packages/drivers/acp/src/client.ts
395
const dispatchNotification = (notification: AcpProtocol.AcpIncomingNotification) => {
396
switch (notification._tag) {
397
case "SessionUpdate": {
398
if (notificationHandlers.sessionUpdate.handlers.length === 0) {
399
notificationHandlers.sessionUpdate.pending.push(notification.params);
400
return Effect.void;
401
}
402
return runNotificationHandlers(notificationHandlers.sessionUpdate, notification.params);
403
}
404
case "ElicitationComplete": {
405
if (notificationHandlers.elicitationComplete.handlers.length === 0) {
406
notificationHandlers.elicitationComplete.pending.push(notification.params);
407
return Effect.void;
packages/drivers/acp/src/protocol.ts
174
const parser = parserFactory.makeUnsafe();
175
const serverQueue = yield* Queue.unbounded<RpcMessage.FromClientEncoded>();
176
const clientQueue = yield* Queue.unbounded<RpcMessage.FromServerEncoded>();
177
const notificationQueue = yield* Queue.unbounded<AcpIncomingNotification>();
178
const disconnects = yield* Queue.unbounded<number>();
179
const outgoing = yield* Queue.unbounded<string | Uint8Array, Cause.Done<void>>();
180
const nextRequestId = yield* Ref.make(1n);
181
const terminationHandled = yield* Ref.make(false);
182
const extPending = yield* Ref.make(HashMap.empty<string, Deferred.Deferred<unknown, AcpError.AcpError>>());
253
const dispatchNotification = (notification: AcpIncomingNotification) =>
254
Queue.offer(notificationQueue, notification).pipe(
255
Effect.andThen(
256
options.onNotification !== undefined
257
? options.onNotification(notification).pipe(Effect.catch(() => Effect.void))
258
: Effect.void
259
),
260
Effect.asVoid
446
yield* options.stdio.stdin.pipe(
447
Stream.runForEach((data) =>
448
logProtocol({
449
direction: "incoming",
450
payload: textFromWire(data),
451
stage: "raw",
452
}).pipe(
453
Effect.flatMap(() =>
454
Effect.try({
455
try: () =>
456
parser.decode(data) as ReadonlyArray<RpcMessage.FromClientEncoded | RpcMessage.FromServerEncoded>,
Attack-path analysis
Kept at medium. The vulnerable statements are accurate: unbounded Effect queues are allocated in packages/drivers/acp/src/protocol.ts:175-179, stdin is decoded/routed continuously at protocol.ts:446-482, notifications are offered to an unbounded queue at protocol.ts:253-260 and exposed via Stream.fromQueue at protocol.ts:573-574, and AcpClient buffers notifications in uncapped arrays at client.ts:362-407. The executable validation evidence reported process OOM under a constrained heap after repeated valid notifications, which supports real availability impact. However, exposure is constrained: ACP is a stdio/child-process driver with no public port, ingress, load balancer, service account, or cloud identity in this repository path, and grep did not find current production integration outside @beep/acp. The realistic attacker is a malicious/compromised connected ACP peer, not an unauthenticated internet client. This supports a meaningful single-process DoS but not high/critical severity.
Path
Attacker-controlled ACP peer --sends valid JSON-RPC/NDJSON notifications--> Stdio stdin stream --continuous decode without size/rate cap--> ACP parser and routeDecodedMessage --Queue.offer to Queue.unbounded--> Unbounded protocol queues --retained messages grow heap--> Host process heap exhaustion
The finding is a real, reachable denial-of-service bug in the ACP driver. The protocol constructor allocates multiple Queue.unbounded instances for server, client, notification, disconnect, and outgoing paths. Incoming stdio data is decoded in a continuous Stream.runForEach path and routed without an evident message-size, rate, or capacity check. Notifications with empty JSON-RPC ids are decoded and always offered to the unbounded notification queue, and the public incoming stream is only Stream.fromQueue(notificationQueue). The client layer then creates plain pending arrays and pushes SessionUpdate and ElicitationComplete notifications when no handler is registered. A targeted grep found only unbounded queue usage in the ACP source and no Queue.bounded/dropping/sliding controls. The attack is not internet-exposed by default because ACP uses stdio/child-process transport, and no IaC/ingress/port exposure was found for this package. Therefore the original medium rating is appropriate: exploitation requires control of a connected ACP peer, but once that precondition is met, valid protocol traffic can exhaust the embedding process memory and deny availability.
Likelihood
Medium - Exploitation is low-complexity after controlling a connected ACP peer and uses valid protocol messages, but the default exposure is stdio/local child-process IPC, not a public network port. Static repository search did not show current use outside the ACP package/tests, which lowers immediate exploit likelihood in the main application.
Impact
Medium - A successful attack can exhaust heap memory and crash or stall the single process embedding the ACP driver, denying availability of the local client/agent integration. The impact is availability-only; no code execution, privilege escalation, data exfiltration, or cross-tenant compromise was evidenced.
Assumptions
ACP peers are treated as untrusted or potentially compromised protocol counterparts once connected over the stdio transport.
The ACP driver can be embedded by product code or downstream consumers through its exported @beep/acp package subpaths, even though static grep did not find use outside packages/drivers/acp in the current checkout.
Availability impact is limited to the process embedding this driver rather than a fleet-wide network service by default.
Attacker controls or compromises an ACP peer connected to the driver over stdio/child-process transport
The embedding application runs makeAcpPatchedProtocol through AcpClient or AcpAgent
The attacker sends valid JSON-RPC/NDJSON notifications or protocol messages faster than they are consumed
Controls
Effect Schema validation is used for typed ACP notification/request payloads, but validation does not limit the number of valid messages or total retained bytes.
No ACP source evidence of Queue.bounded, Queue.dropping, Queue.sliding, message-size cap, rate limit, authentication, or backpressure on the vulnerable queues.
The transport is stdio/child-process based by default, which limits exposure compared with public network ingress.
Blindspots
Static-only repository review cannot prove all downstream deployments or consumers of @beep/acp, especially if this private package is published or vendored elsewhere.
Dependencies were not installed in the validation environment, so direct package tests could not be rerun here; earlier validation used a dependency-free simulation plus source checks.
No runtime manifests or deployment files for ACP-specific services were found; if an embedding application exposes ACP over a network bridge, likelihood could increase.
Memory thresholds and crash timing depend on host heap limits and consumer behavior.
Finding content copied
Finding content copied
```
