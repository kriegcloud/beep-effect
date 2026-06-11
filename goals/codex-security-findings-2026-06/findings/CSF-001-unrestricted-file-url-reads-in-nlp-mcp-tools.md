# CSF-001: Unrestricted file/URL reads in NLP MCP tools

## Metadata

| Field | Value |
|---|---|
| Severity | High |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 4805e97 |
| Reported age | 6d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/drivers/nlp-mcp |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced an unrestricted local file read and arbitrary URL fetch capability through the newly added MCP streaming/file-IO tools. There is no path root restriction, no URL allowlist, and no content-size limit before returning data to the MCP client.

The new nlp MCP server mounts a StreamingToolkit and registers it in .mcp.json. Its schemas only require non-empty path/location strings, and the handlers pass those values directly to FileSystem reads or HttpClient.get. As a result, any MCP client/model with access to this stdio server can read local files available to the user's OS account, such as source secrets, SSH keys, app config, and tokens, or fetch arbitrary HTTP(S) URLs including internal network/metadata endpoints. The returned tool outputs include raw data/lines, enabling exfiltration through normal MCP tool responses. The implementation also lacks size and device-file checks, so large files, special files, or unbounded remote responses can cause denial of service.

## Codex Patch

- Patch file: [`./patches/CSF-001.patch`](./patches/CSF-001.patch)
- Patch status: _pending P5_

## Current-HEAD Triage

- Verdict: _pending P2_
- Disposition: _pending P2_
- Rationale: _pending P2_
- Remediation status: _pending P5_
- Lane: _pending P4_
- Verification command: _pending P2_
- Changed files: _pending P5_
- Verification notes: _pending P5_

## Evidence Paths

- packages/drivers/nlp-mcp/src/Server.ts
- packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts
- packages/drivers/nlp-mcp/src/Streaming/TextStream.ts
- packages/drivers/nlp-mcp/src/StreamingHandlers.ts
- packages/drivers/nlp-mcp/src/StreamingTools.ts
- packages/drivers/nlp-mcp/src/bin.ts
- mcp.json
- .mcp.json

## Validation Notes From Codex

- Confirm the new nlp MCP server is registered and mounts StreamingToolkit.
- Confirm tool schemas accept arbitrary non-empty file paths/locations without root, allowlist, or device/size policy.
- Confirm local file inputs flow to platform FileSystem reads and raw data is returned to the caller.
- Confirm URL inputs flow to unrestricted HttpClient.get/response.text and raw data is returned to the caller.
- Dynamically demonstrate the core vulnerable source path reads an out-of-repo local file and fetches a local HTTP endpoint; full MCP-level execution was not possible due missing dependencies.

## Sanitized Finding Content

```text
Finding
Unrestricted file/URL reads in NLP MCP tools
Report
Patch
Chat
Severity
High

Adjust to improve accuracy in future scans

Commit
4805e97
1:13 PM Jun 2, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced an unrestricted local file read and arbitrary URL fetch capability through the newly added MCP streaming/file-IO tools. There is no path root restriction, no URL allowlist, and no content-size limit before returning data to the MCP client.

The new nlp MCP server mounts a StreamingToolkit and registers it in .mcp.json. Its schemas only require non-empty path/location strings, and the handlers pass those values directly to FileSystem reads or HttpClient.get. As a result, any MCP client/model with access to this stdio server can read local files available to the user's OS account, such as source secrets, SSH keys, app config, and tokens, or fetch arbitrary HTTP(S) URLs including internal network/metadata endpoints. The returned tool outputs include raw data/lines, enabling exfiltration through normal MCP tool responses. The implementation also lacks size and device-file checks, so large files, special files, or unbounded remote responses can cause denial of service.

Validation
Confirm the new nlp MCP server is registered and mounts StreamingToolkit.
Confirm tool schemas accept arbitrary non-empty file paths/locations without root, allowlist, or device/size policy.
Confirm local file inputs flow to platform FileSystem reads and raw data is returned to the caller.
Confirm URL inputs flow to unrestricted HttpClient.get/response.text and raw data is returned to the caller.
Dynamically demonstrate the core vulnerable source path reads an out-of-repo local file and fetches a local HTTP endpoint; full MCP-level execution was not possible due missing dependencies.
Validation artifact
Evidence
mcp.json
Registers the new nlp stdio MCP server, making the newly added tool surface available to MCP clients.
L29-33
packages/drivers/nlp-mcp/src/Server.ts
67
export const makeServerLayer = (
68
config: NlpMcpServerConfig
69
): Layer.Layer<never, never, FileSystem.FileSystem | HttpClient.HttpClient | Path.Path | Stdio> =>
70
Layer.mergeAll(
71
McpServer.toolkit(NlpToolkit).pipe(Layer.provide(WinkNlpToolkitLive)),
72
McpServer.toolkit(StreamingToolkit).pipe(Layer.provide(StreamingToolkitHandlersLive))
73
).pipe(Layer.provide(McpServer.layerStdio({ name: config.name, version: config.version })), Layer.orDie);
packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts
92
export const isUrl = (location: string): boolean => location.startsWith("http://") || location.startsWith("https://");
94
const fetchText = (
95
location: string,
96
timeoutMs: number
97
): Effect.Effect<string, DatasetLoadError, HttpClient.HttpClient> =>
98
HttpClient.get(location).pipe(
99
Effect.flatMap(HttpClientResponse.filterStatusOk),
100
Effect.flatMap((response) => response.text),
101
Effect.timeout(Duration.millis(timeoutMs)),
102
Effect.mapError((cause) => new DatasetLoadError({ cause, location, message: String(cause) }))
103
);
105
const parseJson = (value: string, location: string): Effect.Effect<unknown, DatasetLoadError> =>
106
decodeJson(value).pipe(Effect.mapError((cause) => new DatasetLoadError({ cause, location, message: String(cause) })));
121
export const loadText = (
122
location: string,
123
options: { readonly encoding?: TextEncoding | undefined; readonly timeout?: number | undefined } = {}
124
): Effect.Effect<
125
DatasetResult<string>,
126
DatasetLoadError | PlatformError,
127
FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
128
> =>
129
Effect.gen(function* () {
130
const loadedAt = yield* Clock.currentTimeMillis;
131
if (isUrl(location)) {
132
const data = yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS);
138
const data = yield* readTextFile(location, options.encoding ?? "utf-8");
packages/drivers/nlp-mcp/src/Streaming/TextStream.ts
100
export const streamLines = (
101
filePath: string,
102
options: TextStreamOptions = {}
103
): Stream.Stream<string, PlatformError, FileSystem.FileSystem | Path.Path> => {
114
const resolved = path.resolve(filePath);
116
return fs.stream(resolved).pipe(
163
export const readTextFile = (
164
filePath: string,
165
encoding: TextEncoding = "utf-8"
166
): Effect.Effect<string, PlatformError, FileSystem.FileSystem | Path.Path> =>
167
Effect.gen(function* () {
168
const fs = yield* FileSystem.FileSystem;
169
const path = yield* Path.Path;
170
return yield* fs.readFileString(path.resolve(filePath), encoding);
packages/drivers/nlp-mcp/src/StreamingHandlers.ts
239
stream_load_text: Effect.fn("StreamingToolkit.stream_load_text")(
240
function* ({ location, options }) {
241
yield* Effect.annotateCurrentSpan(pathAttribute(location));
242
const result = yield* DatasetLoader.loadText(location, {
304
stream_read_lines: Effect.fn("StreamingToolkit.stream_read_lines")(
305
function* ({ options, path }) {
306
yield* Effect.annotateCurrentSpan(pathAttribute(path));
packages/drivers/nlp-mcp/src/StreamingTools.ts
326
path: S.String.check(S.isMinLength(1)),
388
const LoadTextParameters = S.Struct({
389
location: S.String.check(S.isMinLength(1)),
605
export const LoadText = Tool.make("stream_load_text", {
606
description: "Load text content from a local file or remote URL. Auto-detects the source type.",

Attack-path analysis

Retain high severity. The issue is real and in scope: the repo registers a stdio MCP server that mounts StreamingToolkit, the schemas allow arbitrary location/path strings, DatasetLoader/TextStream perform unrestricted filesystem reads or HTTP(S) fetches, and handlers return raw data. The impact is high because local secrets and internal HTTP responses can be disclosed to a model/client. It is not raised to critical because there is no public network listener or proven remote unauthenticated path; exploitation requires MCP client/server execution and model/client influence. It is not reduced to medium because, once those normal MCP preconditions hold, exploitation is direct and can expose high-value credentials or private source data.

Path
Attacker-controlled or attacker-influenced MCP tool argument --tool call over stdio--> Repo .mcp.json nlp stdio server --registered StreamingToolkit--> StreamingToolkit stream_load_text/load_lines/load_jsonl/load_json handlers --passes arbitrary location/path--> DatasetLoader and TextStream sinks --readFileString/fs.stream or HttpClient.get--> Local filesystem or HTTP(S) network target --contents returned as data--> Raw data returned to MCP client/model

The finding is valid. The nlp MCP server is registered in .mcp.json and its entrypoint provides Node FileSystem, Path, Stdio, and FetchHttpClient layers. Server.ts mounts StreamingToolkit into that stdio server. The tool schemas accept only non-empty strings for paths and locations, with no root, URL, or size policy. DatasetLoader treats any http:// or https:// string as a URL and fetches it, otherwise it reads the same string as a local file through TextStream.readTextFile(path.resolve(filePath)). StreamingHandlers then returns result.data directly to the MCP caller. This is not internet-exposed by itself because it is stdio-only, but it is reachable from MCP clients/models in the project's threat model and can disclose local secrets or internal HTTP responses once a model/client can invoke the tool.

Likelihood
Medium - The vulnerable path is straightforward and validated: a single tool call with a chosen path or URL reaches the sink. However, exposure is limited to local stdio MCP usage, so exploitation generally requires the victim/operator to run an MCP-enabled client with this repo config and for an attacker to influence tool calls through prompt injection, malicious content, or direct local MCP access. This makes exploitation plausible but not internet-trivial.
Impact
High - Once reachable by an MCP client/model, the tools can read arbitrary files available to the OS account, including source secrets, SSH keys, app configs, tokens, and run data, and can fetch arbitrary HTTP(S) URLs including loopback/internal/metadata endpoints. The response includes raw content, enabling exfiltration through normal MCP outputs. There is no command execution sink, but the confidentiality impact is substantial.
Assumptions
The repository root .mcp.json is consumed by an MCP-capable local agent/editor or other client and starts the nlp stdio server.
An attacker can directly call the MCP server, or can influence a model/client that has access to the server to invoke the streaming tools with attacker-chosen path or URL arguments.
Sensitive files or internal HTTP endpoints are accessible to the OS account and network environment running the MCP server.
Victim/operator runs an MCP client that loads the repository .mcp.json nlp server, or otherwise starts packages/drivers/nlp-mcp/src/bin.ts
Attacker controls or plausibly influences MCP tool arguments through direct MCP access, prompt injection, malicious repository content, or other untrusted model input
Target file or HTTP(S) URL is reachable from the MCP server process
Controls
Transport is stdio-only; no repository evidence of a listening port or public ingress for this MCP server.
Effect schemas require non-empty strings but do not enforce allowed roots, URL allowlists, byte limits, or file type restrictions.
Handlers annotate telemetry with path length/count/size metadata, but raw file or URL contents are returned to the MCP caller.
No server-side authentication, authorization, user approval, or sandbox policy is implemented for the streaming file/URL tools.
Blindspots
Static-only review did not enumerate all MCP clients that may consume .mcp.json or their consent/approval UX.
Full dependency-backed MCP execution was not repeated in this stage; validation evidence used actual source files with local Effect stubs due dependency installation failures.
No cloud APIs were called, so metadata endpoint impact is inferred from arbitrary HTTP(S) reachability rather than tested against a real cloud runtime.
Repository artifacts do not reveal the operator's actual filesystem permissions, network egress rules, or whether external LLM providers receive MCP tool results.
```
