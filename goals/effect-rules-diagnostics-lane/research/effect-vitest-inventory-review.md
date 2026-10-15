# Effect Vitest inventory review — 2026-10-14

The closeout gate reports one new identity in
`packages/tooling/tool/cli/test/effect-vitest-contract.test.ts`.
Canonical schema-validated `--rows` output shows the same EV014 site at line 567:
`it.layer(BunCrypto.layer)`, class `resource-layer-without-hook-timeout`, severity
major, status open. Only its v2 occurrence changes because its enclosing test
body now constructs an equivalent fixture string with A.join instead of native
Array.join. The focused contract tests pass; no resource acquisition, timeout,
layer, test subject or expected fixture text changed.

- Old occurrence: `v2:bff80d9b56573a5aed0295802078869f994a9e8ef4a9deba1363388637dd5ea4`.
- New occurrence: `v2:f429535c2882448d0a3efe6da8ab03b60d061646780d7d94828aae0a5c124aa1`.
- The NodeServices EV014 site's occurrence stays identical; its line moves 827 → 830.
- EV010's platform-resource review stays identical.

Decision: refresh through the owned `beep lint effect-vitest --write` command,
then inspect the diff and rerun the gate. Preserve all statuses, severities and
reasons; this grants no new exception and does not mark a resource issue fixed.
Reverse by restoring the prior inventory together with the prior fixture text.
Raw JSONL rows stay under the H2 cache, not in the packet.

The full writer also refreshed stale metadata in untouched lint-workers and
policy-fingerprint-turbo-inputs tests and dropped an unrelated orphan row.
Those changes are excluded. The retained projection uses only the writer's
values for locator fields (id, line, endLine, occurrence) in four source files
owned by H2. A machine comparison asserts all semantic fields, statuses and
severities are identical. It retains 1,976 rows and changes 16 locator fields;
no row is added or removed. The raw writer output and projection receipt stay
in cache for review.
