# Codex Security Findings Index

Captured from Codex Security on 2026-05-19. This index covers all 64 findings visible in the authenticated Codex Security UI for `kriegcloud/beep-effect` with severities `critical,high,medium,low,informational`.

## Queue Summary

| Status | Count |
|---|---:|
| needs-current-head-review | 0 |
| active | 0 |
| dismissed | 1 |
| fixed | 63 |

## Severity Summary

| Severity | Count |
|---|---:|
| High | 1 |
| Medium | 20 |
| Low | 21 |
| Informational | 22 |

## Findings

| ID | Severity | Verdict | Codex Status | Title | Owner Area | Source Commit |
|---|---|---|---|---|---|---|
| CSF-001 | High | fixed | Closed | [Prompt templates can execute shell commands during sandbox runs](./CSF-001-prompt-templates-can-execute-shell-commands-during-sandbox-runs.md) | packages/foundation/capability/sandbox | d1c7412 |
| CSF-002 | Medium | fixed | Closed | [Grouped lint buffers unbounded subprocess output](./CSF-002-grouped-lint-buffers-unbounded-subprocess-output.md) | packages/tooling/tool/cli | e6f1914 |
| CSF-003 | Medium | fixed | Closed | [Runpod eval trusts public templates by default](./CSF-003-runpod-eval-trusts-public-templates-by-default.md) | packages/tooling/tool/cli | 55d2735 |
| CSF-004 | Medium | fixed | Closed | [Alternate proof URL leaks upload bearer token](./CSF-004-alternate-proof-url-leaks-upload-bearer-token.md) | initiatives/stack-installer | 1722c83 |
| CSF-005 | Medium | fixed | Closed | [Upload helper can kill arbitrary processes via PID file](./CSF-005-upload-helper-can-kill-arbitrary-processes-via-pid-file.md) | apps/stack-installer | ad43454 |
| CSF-006 | Medium | fixed | Closed | [Malformed Host header crashes proof upload server](./CSF-006-malformed-host-header-crashes-proof-upload-server.md) | initiatives/stack-installer | ea4b6d4 |
| CSF-007 | Medium | fixed | Closed | [Unsafe proof bundle extraction accepts untrusted archives](./CSF-007-unsafe-proof-bundle-extraction-accepts-untrusted-archives.md) | apps/stack-installer | 00dbb3c |
| CSF-008 | Medium | fixed | Closed | [Raw proof request is persisted in artifact transcript](./CSF-008-raw-proof-request-is-persisted-in-artifact-transcript.md) | apps/stack-installer | 6ae84dd |
| CSF-009 | Medium | fixed | Closed | [P1 proof resolves arbitrary 1Password references](./CSF-009-p1-proof-resolves-arbitrary-1password-references.md) | apps/stack-installer | 073e7de |
| CSF-010 | Medium | fixed | Closed | [Unbounded face-detection image tensors can exhaust memory](./CSF-010-unbounded-face-detection-image-tensors-can-exhaust-memory.md) | packages/drivers/face-detection/src | 3ce0fe0 |
| CSF-011 | Medium | fixed | Closed | [Worker eval exposes repo files to prompt-injected Codex runs](./CSF-011-worker-eval-exposes-repo-files-to-prompt-injected-codex-runs.md) | packages/tooling/tool/cli | e572119 |
| CSF-012 | Medium | fixed | Closed | [Generated timer now executes Bun via captured PATH](./CSF-012-generated-timer-now-executes-bun-via-captured-path.md) | packages/tooling/library/ai-metrics | dc0a1f0 |
| CSF-013 | Medium | fixed | Closed | [Unbounded export-list text hashing enables docgen DoS](./CSF-013-unbounded-export-list-text-hashing-enables-docgen-dos.md) | packages/tooling/tool/cli | f15eec8 |
| CSF-014 | Medium | fixed | Closed | [Symlink traversal in migrated quality file scanner](./CSF-014-symlink-traversal-in-migrated-quality-file-scanner.md) | packages/tooling/tool/cli | 1b110cb |
| CSF-015 | Medium | fixed | Closed | [Timer generator allows shell and systemd injection](./CSF-015-timer-generator-allows-shell-and-systemd-injection.md) | packages/tooling/library/ai-metrics | 4a06615 |
| CSF-016 | Medium | fixed | Closed | [Quadratic JSDoc category normalization can hang docgen](./CSF-016-quadratic-jsdoc-category-normalization-can-hang-docgen.md) | packages/tooling/tool/cli | 511daf4 |
| CSF-017 | Medium | fixed | Closed | [Unbounded ACP queues allow peer-driven memory exhaustion](./CSF-017-unbounded-acp-queues-allow-peer-driven-memory-exhaustion.md) | packages/drivers/acp/src | 2ccabc0 |
| CSF-018 | Medium | fixed | Closed | [Tests may target production DATABASE_URL](./CSF-018-tests-may-target-production-database-url.md) | packages/tooling/test-kit/test-utils | ff5d74f |
| CSF-019 | Medium | fixed | Closed | [Committed Playwright snapshots leak OpenClaw metadata](./CSF-019-committed-playwright-snapshots-leak-openclaw-metadata.md) | playwright-cli/page-2026-05-01T10-01-36-589Z.yml | ee4cf4e |
| CSF-020 | Medium | fixed | Closed | [Database error diagnostics leak SQL parameters](./CSF-020-database-error-diagnostics-leak-sql-parameters.md) | packages/drivers/drizzle/src | 38ba635 |
| CSF-021 | Medium | fixed | Closed | [AES-GCM nonce reuse across batched event log encryption](./CSF-021-aes-gcm-nonce-reuse-across-batched-event-log-encryption.md) | packages/effect/src/unstable | 200a511 |
| CSF-022 | Low | fixed | Closed | [CSP nonce now uses non-cryptographic randomness](./CSF-022-csp-nonce-now-uses-non-cryptographic-randomness.md) | apps/opip-web | 447ea2e |
| CSF-023 | Low | fixed | Closed | [Professional desktop dev server binds to all interfaces](./CSF-023-professional-desktop-dev-server-binds-to-all-interfaces.md) | apps/professional-desktop | dd79b67 |
| CSF-024 | Low | fixed | Closed | [Sanity projectId can redirect API requests](./CSF-024-sanity-projectid-can-redirect-api-requests.md) | packages/drivers/sanity/src | e14cb54 |
| CSF-025 | Low | fixed | Closed | [ps failure path can leak process command lines](./CSF-025-ps-failure-path-can-leak-process-command-lines.md) | initiatives/stack-installer | 9097bfc |
| CSF-026 | Low | fixed | Closed | [Proof watch helper trusts PID and file paths](./CSF-026-proof-watch-helper-trusts-pid-and-file-paths.md) | initiatives/stack-installer | 76e62e1 |
| CSF-027 | Low | fixed | Closed | [Live tailnet upload endpoint committed to docs](./CSF-027-live-tailnet-upload-endpoint-committed-to-docs.md) | initiatives/stack-installer | 57d5180 |
| CSF-028 | Low | fixed | Closed | [Remote status endpoint leaks coordinator output path](./CSF-028-remote-status-endpoint-leaks-coordinator-output-path.md) | initiatives/stack-installer | e24fc20 |
| CSF-029 | Low | fixed | Closed | [Status helper replays unescaped upload logs](./CSF-029-status-helper-replays-unescaped-upload-logs.md) | initiatives/stack-installer | 2945c63 |
| CSF-030 | Low | fixed | Closed | [Tailnet upload endpoint disclosed in committed audit notes](./CSF-030-tailnet-upload-endpoint-disclosed-in-committed-audit-notes.md) | initiatives/stack-installer | 8f36343 |
| CSF-031 | Low | fixed | Closed | [Internal SMB peer details disclosed in audit notes](./CSF-031-internal-smb-peer-details-disclosed-in-audit-notes.md) | initiatives/stack-installer | 6ec9c16 |
| CSF-032 | Low | fixed | Closed | [Stack Installer dev server binds to all interfaces](./CSF-032-stack-installer-dev-server-binds-to-all-interfaces.md) | apps/stack-installer | 6a86555 |
| CSF-033 | Low | fixed | Closed | [Predictable /tmp paths for AI metrics proof data](./CSF-033-predictable-tmp-paths-for-ai-metrics-proof-data.md) | initiatives/ai-metrics-stack | 7033ed3 |
| CSF-034 | Low | fixed | Closed | [Retention delete trusts traversable archive IDs](./CSF-034-retention-delete-trusts-traversable-archive-ids.md) | packages/tooling/library/ai-metrics | 408f4c2 |
| CSF-035 | Low | fixed | Closed | [SAST skips changed JavaScript/TypeScript symlinks](./CSF-035-sast-skips-changed-javascript-typescript-symlinks.md) | packages/tooling/tool/cli | b07de7b |
| CSF-036 | Low | fixed | Closed | [Shared DuckDB connection breaks transaction isolation](./CSF-036-shared-duckdb-connection-breaks-transaction-isolation.md) | packages/drivers/duckdb/src | fb91cc5 |
| CSF-037 | Low | fixed | Closed | [Encrypted archive leaks plaintext hashes](./CSF-037-encrypted-archive-leaks-plaintext-hashes.md) | packages/tooling/library/ai-metrics | a3857ad |
| CSF-038 | Low | fixed | Closed | [AI metrics privacy output leaks transcript identifiers](./CSF-038-ai-metrics-privacy-output-leaks-transcript-identifiers.md) | packages/tooling/library/ai-metrics | aa86796 |
| CSF-039 | Low | fixed | Closed | [Host-network PGLite fallback exposes test database](./CSF-039-host-network-pglite-fallback-exposes-test-database.md) | tooling/test-utils | 0c25ebd |
| CSF-040 | Low | fixed | Closed | [Unrestricted ffmpeg processing can trigger local SSRF](./CSF-040-unrestricted-ffmpeg-processing-can-trigger-local-ssrf.md) | tooling/cli | af06b2a |
| CSF-041 | Low | fixed | Closed | [Enumerable __proto__ in Struct.fromEntries enables pollution](./CSF-041-enumerable-proto-in-struct-fromentries-enables-pollution.md) | packages/common/utils/src | 7ed5024 |
| CSF-042 | Low | fixed | Closed | [Glob scan now aborts on dangling symlinks causing DoS](./CSF-042-glob-scan-now-aborts-on-dangling-symlinks-causing-dos.md) | packages/foundation/modeling/utils/src | 8199257 |
| CSF-043 | Informational | fixed | Closed | [Docs aux_links key is not nested under aux_links](./CSF-043-docs-aux-links-key-is-not-nested-under-aux-links.md) | apps/professional-desktop | 0b3fc6e |
| CSF-044 | Informational | fixed | Closed | [Schema assertions now return without validating](./CSF-044-schema-assertions-now-return-without-validating.md) | packages/foundation/modeling/utils | b8bc609 |
| CSF-045 | Informational | fixed | Closed | [Stale Bun lock keeps old Next peer copies](./CSF-045-stale-bun-lock-keeps-old-next-peer-copies.md) | apps/opip-web | 02c1fba |
| CSF-046 | Informational | fixed | Closed | [Host header poisoning in proof upload landing page](./CSF-046-host-header-poisoning-in-proof-upload-landing-page.md) | initiatives/stack-installer | d8f1ede |
| CSF-047 | Informational | fixed | Closed | [Unvalidated PID is negated for process-group kill](./CSF-047-unvalidated-pid-is-negated-for-process-group-kill.md) | initiatives/stack-installer | 6eb1d33 |
| CSF-048 | Informational | fixed | Closed | [Proof watch aborts on partial bundle transfers](./CSF-048-proof-watch-aborts-on-partial-bundle-transfers.md) | apps/stack-installer | 60ac17f |
| CSF-049 | Informational | fixed | Closed | [Optional JSON bodies are generated but still rejected](./CSF-049-optional-json-bodies-are-generated-but-still-rejected.md) | packages/drivers/runpod/scripts | 342c52d |
| CSF-050 | Informational | dismissed | Closed | [Worker migration drops existing assignee data](./CSF-050-worker-migration-drops-existing-assignee-data.md) | packages/_internal/db-admin/drizzle | b99c7b8 |
| CSF-051 | Informational | fixed | Closed | [Agent task migration orphans dependent metric rows](./CSF-051-agent-task-migration-orphans-dependent-metric-rows.md) | packages/tooling/library/ai-metrics | deb5047 |
| CSF-052 | Informational | fixed | Closed | [Agent task ID migration orphans related metrics rows](./CSF-052-agent-task-id-migration-orphans-related-metrics-rows.md) | packages/tooling/library/ai-metrics | 1ec6e3a |
| CSF-053 | Informational | fixed | Closed | [ACP protocol exposes Effect HashSet as native ReadonlySet](./CSF-053-acp-protocol-exposes-effect-hashset-as-native-readonlyset.md) | packages/drivers/acp/src | 6912323 |
| CSF-054 | Informational | fixed | Closed | [DuckDB schema change breaks existing AI metrics stores](./CSF-054-duckdb-schema-change-breaks-existing-ai-metrics-stores.md) | packages/tooling/library/ai-metrics | d20bea9 |
| CSF-055 | Informational | fixed | Closed | [Caption creation follows symlinks and can overwrite files](./CSF-055-caption-creation-follows-symlinks-and-can-overwrite-files.md) | tooling/cli | 1004b9f |
| CSF-056 | Informational | fixed | Closed | [Cause formatting returns reason instead of PostgresError](./CSF-056-cause-formatting-returns-reason-instead-of-postgreserror.md) | packages/drivers/postgres/src | d021c3a |
| CSF-057 | Informational | fixed | Closed | [Untrusted ffprobe lookup can execute attacker code](./CSF-057-untrusted-ffprobe-lookup-can-execute-attacker-code.md) | tooling/cli | 7b7260b |
| CSF-058 | Informational | fixed | Closed | [PGLite test DB exposed with default credentials](./CSF-058-pglite-test-db-exposed-with-default-credentials.md) | tooling/test-utils | 1dbf931 |
| CSF-059 | Informational | fixed | Closed | [LocalDate constructors allow impossible calendar dates](./CSF-059-localdate-constructors-allow-impossible-calendar-dates.md) | packages/shared/domain/src | b06f2f3 |
| CSF-060 | Informational | fixed | Closed | [Unbound CauseTaggedErrorClass helpers now crash](./CSF-060-unbound-causetaggederrorclass-helpers-now-crash.md) | packages/common/schema/src | bb74c4f |
| CSF-061 | Informational | fixed | Closed | [IndexedDbQueryBuilder stream can hang with zero chunk size](./CSF-061-indexeddbquerybuilder-stream-can-hang-with-zero-chunk-size.md) | packages/platform-browser/src/IndexedDbQueryBuilder.ts | 1e38762 |
| CSF-062 | Informational | fixed | Closed | [Custom glob walker now traverses full tree, enabling DoS](./CSF-062-custom-glob-walker-now-traverses-full-tree-enabling-dos.md) | packages/foundation/modeling/utils/src | d70aed0 |
| CSF-063 | Informational | fixed | Closed | [Markdown-to-HTML schema allows raw script tags by default](./CSF-063-markdown-to-html-schema-allows-raw-script-tags-by-default.md) | packages/common/schema/src | 0cf18c4 |
| CSF-064 | Informational | fixed | Closed | [IntelliJ shared index auto-consent to external server](./CSF-064-intellij-shared-index-auto-consent-to-external-server.md) | intellij.yaml | a6dd7e3 |
