# Coverage runtime receipts and ignored worktree cache input review

This review authorizes recording the intentional effective cache-configuration changes listed below. It grants no new cache qualification, enables no task reuse, and changes no qualification ledger state.

The canonical cache audit reports **171 configuration-drift blocks**: 12 cached root tasks and 159 workspace test tasks. The existing projection contains exactly those same 159 executable test tasks, all cached; their prior environment list is `BEEP_FC_NUM_RUNS` and `BEEP_FC_SEED`. The root `test` definition adds `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to that list, binding same-execution runtime-receipt identity and destination to the task hash. Both keys are plain invocation metadata, not secrets. The change does not permit a cached test to impersonate fresh runtime evidence: artifact-producing execution still forces fresh tests and validates receipt identity.

Exactly **28 root task input lists** append `!.claude/worktrees/**`; all other fields in those task definitions are unchanged. Twelve are cached and appear in the blocking census below; the other sixteen remain uncached. The removed input identities belong to git-ignored nested checkouts of other branches, including their installed dependencies. They are not sources of this checkout. No task command, tested source include, output declaration, cache setting, dependency edge or shared root setting is changed by these exclusions. The prior unbounded native dry-run input set included hundreds of thousands of files from these other checkouts; the narrow exclusion restores the existing bounded census without widening its byte limit or timeout. Other lanes are preserved.

The remaining root task-definition delta is only the two test environment keys above. Root `turbo.json` also updates its schema URL to Turbo 2.11.10. Eighteen other Turbo source-digest changes are byte-for-byte the same files after reversing only the schema URL from 2.11.10 to 2.11.9; their effective task settings are unchanged. The exact previous root source digest matches the reviewed baseline, so its full source change is accounted for by the schema URL, these 28 exclusions and the two environment keys.

## Review limits

Retain the baseline profile, epoch and four-task scope unchanged. Retain every qualification ledger entry and history event unchanged. Existing excluded qualification tuples remain excluded. This records configuration provenance only; the audit's 1,397 unassessed cached computations do not become qualified. No new exception row, standards debt or review scope is introduced. The baseline request must bind the exact previous baseline text and this document's exact bytes. Re-run the canonical audit after official application; any additional drift requires a new explicit review rather than an expanded subject list.

## Every blocking task and reviewed subject

Each root row below reviews only the appended ignored-worktree input exclusion. Each workspace row reviews only inheritance of the two runtime-receipt environment keys. Subjects are the package prefix or `//`; all 171 task identities are explicit.

| Task | Subject | Reviewed input change |
| --- | --- | --- |
| `//#config-sync:check` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#jsdoc:inventory:check` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#lint:identity-registry` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#lint:jsdoc:root` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#lint:opaque-roundtrips` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#lint:package-scripts` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#lint:schema-first` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:changeset-graph` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:sherif` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:syncpack` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:versions` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `//#topo-sort` | `//` | Append `!.claude/worktrees/**` to inputs. |
| `@beep/acp#test` | `@beep/acp` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/agents-client#test` | `@beep/agents-client` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/agents-domain#test` | `@beep/agents-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/agents-server#test` | `@beep/agents-server` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/agents-tables#test` | `@beep/agents-tables` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/agents-use-cases#test` | `@beep/agents-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ai-provider-cli#test` | `@beep/ai-provider-cli` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ai-sync#test` | `@beep/ai-sync` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/anthropic#test` | `@beep/anthropic` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/api-docs#test` | `@beep/api-docs` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/api-transport#test` | `@beep/api-transport` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-client#test` | `@beep/architecture-lab-client` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-config#test` | `@beep/architecture-lab-config` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-domain#test` | `@beep/architecture-lab-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-proof#test` | `@beep/architecture-lab-proof` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-server#test` | `@beep/architecture-lab-server` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-tables#test` | `@beep/architecture-lab-tables` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-ui#test` | `@beep/architecture-lab-ui` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/architecture-lab-use-cases#test` | `@beep/architecture-lab-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/box#test` | `@beep/box` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/box-provisioning#test` | `@beep/box-provisioning` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/brand#test` | `@beep/brand` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/chalk#test` | `@beep/chalk` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ciops#test` | `@beep/ciops` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/codegen-kit#test` | `@beep/codegen-kit` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/colors#test` | `@beep/colors` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/cosmos#test` | `@beep/cosmos` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/data#test` | `@beep/data` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/db-admin#test` | `@beep/db-admin` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/discord#test` | `@beep/discord` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/doc-text#test` | `@beep/doc-text` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/dock#test` | `@beep/dock` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/dock-react#test` | `@beep/dock-react` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/docket-intake#test` | `@beep/docket-intake` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/documents-domain#test` | `@beep/documents-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/documents-server#test` | `@beep/documents-server` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/documents-tables#test` | `@beep/documents-tables` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/documents-use-cases#test` | `@beep/documents-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/drizzle#test` | `@beep/drizzle` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/duckdb#test` | `@beep/duckdb` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ecfr#test` | `@beep/ecfr` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/editor#test` | `@beep/editor` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/effect-drizzle#test` | `@beep/effect-drizzle` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/epistemic-client#test` | `@beep/epistemic-client` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/epistemic-config#test` | `@beep/epistemic-config` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/epistemic-domain#test` | `@beep/epistemic-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/epistemic-server#test` | `@beep/epistemic-server` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/epistemic-tables#test` | `@beep/epistemic-tables` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/epistemic-ui#test` | `@beep/epistemic-ui` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/epistemic-use-cases#test` | `@beep/epistemic-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/exiftool#test` | `@beep/exiftool` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/face-detection#test` | `@beep/face-detection` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/fc-runs#test` | `@beep/fc-runs` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ffmpeg#test` | `@beep/ffmpeg` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/file-processing#test` | `@beep/file-processing` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/firecrawl#test` | `@beep/firecrawl` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/freshbooks#test` | `@beep/freshbooks` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/gov-legal-mcp#test` | `@beep/gov-legal-mcp` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/govinfo#test` | `@beep/govinfo` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/graph-3d#test` | `@beep/graph-3d` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/html#test` | `@beep/html` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/hubspot#test` | `@beep/hubspot` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/identity#test` | `@beep/identity` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/infra#test` | `@beep/infra` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/langextract#test` | `@beep/langextract` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/law-practice-domain#test` | `@beep/law-practice-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/law-practice-server#test` | `@beep/law-practice-server` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/law-practice-tables#test` | `@beep/law-practice-tables` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/law-practice-use-cases#test` | `@beep/law-practice-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/lejeune-bolt-workbench#test` | `@beep/lejeune-bolt-workbench` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/lexical-schema#test` | `@beep/lexical-schema` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/libpff#test` | `@beep/libpff` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/lint-rules#test` | `@beep/lint-rules` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/m365#test` | `@beep/m365` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/m365-mcp#test` | `@beep/m365-mcp` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/mcp-kit#test` | `@beep/mcp-kit` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/mcpb-kit#test` | `@beep/mcpb-kit` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/md#test` | `@beep/md` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/n3#test` | `@beep/n3` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/nlp#test` | `@beep/nlp` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/nlp-mcp#test` | `@beep/nlp-mcp` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/nlp-processing#test` | `@beep/nlp-processing` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/obs#test` | `@beep/obs` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/observability#test` | `@beep/observability` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/occt#test` | `@beep/occt` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/oip-web#test` | `@beep/oip-web` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/onepassword-cli#test` | `@beep/onepassword-cli` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ontology#test` | `@beep/ontology` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ontology-client#test` | `@beep/ontology-client` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ontology-config#test` | `@beep/ontology-config` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ontology-domain#test` | `@beep/ontology-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ontology-server#test` | `@beep/ontology-server` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ontology-ui#test` | `@beep/ontology-ui` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ontology-use-cases#test` | `@beep/ontology-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/openai#test` | `@beep/openai` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/openai-compat#test` | `@beep/openai-compat` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/openclaw#test` | `@beep/openclaw` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/oxigraph#test` | `@beep/oxigraph` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/pacer#test` | `@beep/pacer` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/palantiri#test` | `@beep/palantiri` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/pandoc-ast#test` | `@beep/pandoc-ast` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/pdf-tools#test` | `@beep/pdf-tools` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/pglite#test` | `@beep/pglite` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/phoenix#test` | `@beep/phoenix` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/poppler#test` | `@beep/poppler` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/postgres#test` | `@beep/postgres` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-claude-mod#test` | `@beep/practice-claude-mod` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-gateway#test` | `@beep/practice-gateway` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-identify#test` | `@beep/practice-identify` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-kg-mcp#test` | `@beep/practice-kg-mcp` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-m365-contacts#test` | `@beep/practice-m365-contacts` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-mail-tagging#test` | `@beep/practice-mail-tagging` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-review-hub#test` | `@beep/practice-review-hub` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/practice-setup#test` | `@beep/practice-setup` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/pretext#test` | `@beep/pretext` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/professional-desktop#test` | `@beep/professional-desktop` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/provenance#test` | `@beep/provenance` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/qa-capture#test` | `@beep/qa-capture` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/rdf#test` | `@beep/rdf` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/rdf-canonize#test` | `@beep/rdf-canonize` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/repo-ai-metrics#test` | `@beep/repo-ai-metrics` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/repo-cli#test` | `@beep/repo-cli` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/repo-configs#test` | `@beep/repo-configs` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/repo-docgen#test` | `@beep/repo-docgen` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/repo-utils#test` | `@beep/repo-utils` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/runpod#test` | `@beep/runpod` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/sanity#test` | `@beep/sanity` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/schema#test` | `@beep/schema` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/semantic-web#test` | `@beep/semantic-web` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/semantica#test` | `@beep/semantica` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/shacl#test` | `@beep/shacl` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/shared-domain#test` | `@beep/shared-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/shared-tables#test` | `@beep/shared-tables` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/shared-use-cases#test` | `@beep/shared-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/skill-contract#test` | `@beep/skill-contract` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/storybook#test` | `@beep/storybook` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/t3-code#test` | `@beep/t3-code` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/tailscale#test` | `@beep/tailscale` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/technical-drawing#test` | `@beep/technical-drawing` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/tesseract#test` | `@beep/tesseract` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/test-runner#test` | `@beep/test-runner` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/test-utils#test` | `@beep/test-utils` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/tika#test` | `@beep/tika` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/todox#test` | `@beep/todox` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/trustgraph-workbench#test` | `@beep/trustgraph-workbench` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/types#test` | `@beep/types` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/ui#test` | `@beep/ui` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/uspto#test` | `@beep/uspto` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/uspto-mcp#test` | `@beep/uspto-mcp` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/utils#test` | `@beep/utils` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/venice-ai#test` | `@beep/venice-ai` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/windows-secrets#test` | `@beep/windows-secrets` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/wink#test` | `@beep/wink` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/workspace-domain#test` | `@beep/workspace-domain` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/workspace-server#test` | `@beep/workspace-server` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/workspace-tables#test` | `@beep/workspace-tables` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/workspace-use-cases#test` | `@beep/workspace-use-cases` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/xai#test` | `@beep/xai` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |
| `@beep/xstate#test` | `@beep/xstate` | Add `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed env. |

## All root input exclusions, including uncached tasks

- `//#changeset:status` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#config-sync:check` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:audit:check` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:boundaries:advisory` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:boundaries:config-check` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:dead-code:check` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:fix-preview:advisory` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:flags:advisory` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:health:advisory` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:health:check` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#fallow:security:advisory` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#jsdoc:inventory:check` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#knowledge:refs-check` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#knowledge:semantic-delta` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:identity-registry` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:jsdoc:root` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:opaque-roundtrips` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:oxlint` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:package-scripts` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:retired-effect-paths` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:schema-first` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:shadcn` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#lint:typos` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#repo-sanity:changeset-graph` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#repo-sanity:sherif` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#repo-sanity:syncpack` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#repo-sanity:versions` — append only `!.claude/worktrees/**`; cache setting unchanged.
- `//#topo-sort` — append only `!.claude/worktrees/**`; cache setting unchanged.

## Configuration source bytes

The 18 non-root rows below are schema-URL-only source updates. The root row also contains the reviewed input and environment changes above.

| Source | Prior SHA-256 | Reviewed SHA-256 |
| --- | --- | --- |
| `apps/docket-intake/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/labs/api-docs/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/labs/ciops/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/oip-web/turbo.json` | `136d8bc171d4c7659388ac0d50f087287dce0947b465ad56730efad7784a9aff` | `dba3f716c7a3ec2b6241eeffd2004a31c054c0e1e4ac8ab572ccc3a4d5a3e468` |
| `apps/practice-claude-mod/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/practice-identify/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/practice-m365-contacts/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/practice-mail-tagging/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/practice-review-hub/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/practice-setup/turbo.json` | `d32a35c31c730ce6b85b37f81581e49b192667fc0df762e0d6bac597f9986787` | `80938e084f3274721a66d1b33b35cfa250168e89775191d5bfde311a98954709` |
| `apps/professional-desktop/turbo.json` | `715d1c999d0659ebcafa23be7b96073fc96f28eea7b535eaa02e30abd992e6f4` | `fbabf0485199158999e72970af6f5551adfb690191bad72aab962d415554b543` |
| `apps/storybook/turbo.json` | `24ae08a1be2011554d9a2dd73894610fe6089bb9ce8228dbadd7cdcd23cdfbd3` | `1e2b850fcd13e1031be1dcdb1f9b42678d76827f032250d871955a815c2f4dac` |
| `apps/todox/turbo.json` | `4e2b58bbe1225f62502d9fb4dfacab017ce405c4a2da98e3a9055c7002ceddf5` | `d9022d5089c8a38fc122e1804847c0fb90699b2c2aff49b4de496d18fcc37a8d` |
| `packages/foundation/modeling/identity/turbo.json` | `1e41eee1a9c445e82871c3bdc4582275c3920281406b3959c90c28d6944e7553` | `b2cf6ff3291c134a7ee884245d21fbedf5bf6ef87f3c9131407db4492b005a97` |
| `packages/foundation/primitive/types/turbo.json` | `5c3b9bc6806f53037f0e48638313d54153ee61c0370f03ef3ff0959feb78602d` | `6c8d1d6e3c12318fa0273a3ec1585487e4661e8a80bda2ccf5d48a2c821dedd4` |
| `packages/tooling/library/ai-sync/turbo.json` | `dc1e160de701f4ca2a94319261f0eb58cf96721612393d1d535c803747629016` | `5cc095a94e178fcb27d2c0a266300a0e7551a39e5833d7e9b8a8f432e5b8d77e` |
| `packages/tooling/policy-pack/repo-configs/turbo.json` | `dab1b6ed3a743a1000d38e0f780409303f932e728c7d3f5a09109424c8655aaa` | `a8d6070aa5f31cb7d0f9fd42550a5adba806912fdd18ca84c18ee47f5649987b` |
| `packages/tooling/tool/cli/turbo.json` | `d4351ddcf59fee063f5eb6fa8e3a16677a836dd1123777fc1f24a2494420c9e2` | `348c85c459957b74a9aa02967e06083bb0a010bf34ff3312247d0abc1d22656e` |
| `turbo.json` | `d045b0a2c83ede241d0e8b07dabcf1eed35eb974d597693f22f153f5636ca906` | `4c13bdd2cd91ba23d81a3c750a65d084d669c931c447a6f0d96faec61e5d7efc` |

## Retained qualification boundaries

- Profile: `local-linux-x64-bun1.4.2`.
- Epoch: `qualification-v2`.
- Existing scope computation: `@beep/identity#lint`.
- Existing scope computation: `@beep/types#lint`.
- Existing scope computation: `@beep/fc-runs#lint`.
- Existing scope computation: `@beep/test-runner#lint`.
- Qualification ledger exact-text SHA-256 before application: `13067bf343f413b4cc99b4cefca3ce7d094a1f09247a54ffc20114e766d4d2bb`. It must remain unchanged.

The reviewed request names only the 160 drift-owned subjects in the task table. Root owns official baseline application and the subsequent audit.
