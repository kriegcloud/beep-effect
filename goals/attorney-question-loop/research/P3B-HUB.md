# P3b design: the workstation review hub

Status: design, 2026-10-14. This document is normative for P3b. It implements the data-plane
ruling in the SPEC Decision Log: a workstation review hub over the tailnet is the one source of
truth for review items, answers and verdicts.

## Shape

A new app, `apps/practice-review-hub`, scaffolded with `bun run beep create-package` (never by
hand). It serves one MCP endpoint over HTTP with `McpServer.layerHttp` from `effect/ai/McpServer`
on an `HttpRouter`. It uses the protocol list and conventions from `@beep/mcp-kit`
(`statelessMcpProtocols`, tool annotations).

- **Bind.** It listens on `127.0.0.1` only. `tailscale serve` (driver `@beep/tailscale`) exposes
  it on the tailnet. The hub never listens on a public interface.
- **Auth.** Every request must carry a `Tailscale-User-Login` header (set by `tailscale serve`)
  that is on a configured allow-list. A missing or unknown login gets HTTP 403 before any tool
  runs. The allow-list and port are config (flags plus env), not secrets. No token is needed:
  the loopback bind plus the tailnet identity is the boundary, and the Decision Log records it.

## Stores (server package)

The server adapters are JSONL files in a configured data directory on the workstation:
- `VerdictLog` for `ReviewQueue`;
- `AnswerLog` for `QuestionQueue`;
- a new `ReviewItemStore` port (in use-cases, beside the queues): `upsert(items)`, which is
  idempotent by `itemId` (the latest write wins), and `list`.

Appends are serialized with one semaphore per file and synced to disk. Reads decode every line,
and a corrupt line fails the read with a typed error. Producers on the workstation (docket-intake
questions, claim self-check findings) write items through `ReviewItemStore` in process. They do
not go through the hub.

## Tools (the contract for the `practice-claude-mod-review-queue` pane)

| Tool | Input | Output | Uses |
| --- | --- | --- | --- |
| `review_open_items` | `{ today: LocalDate }` | the open verdict items plus the question digest, in a stable order | `ReviewItemStore.list`, `ReviewQueue.openItems`, `QuestionQueue.digest` |
| `review_record_verdict` | `RecordVerdictInput` | `VerdictRow` | `ReviewQueue.recordVerdict` |
| `review_lock_batch` | `{ batchId }` | `VerdictRow` (the lock row) | `ReviewQueue.lockBatch` |
| `review_record_answer` | `{ itemId, answer: RecordAnswerInput }` | `AnswerRow` | the hub looks up the `question` item by id, then calls `QuestionQueue.recordAnswer` |

- Each tool's parameters and success schemas are the existing schemas; there are no new
  shapes.
- Typed errors map to MCP tool errors with a stable code: `not-found`, `locked`,
  `unknown-option`, `store-unavailable`.
- Every tool is read-only except the three writes, and the annotations say which.
- The hub never writes the calendar. Proposals are applied by the operator through
  `QuestionWrites` (P3c).

## Tests

- In process: an HTTP client against the hub layer, with the stores in a temporary directory.
  - A request without a login gets 403, and one from an unknown login gets 403.
  - Open items list both kinds.
  - Recording a verdict and then an answer changes the next open-items result.
  - Locked and unknown-option errors map to the right codes.
- Store tests: append, read back, a corrupt line, and upsert idempotence.

## Out of scope for P3b

Running `tailscale serve` and the systemd units (P3c). The pane client belongs to the review-queue
follow-on.
