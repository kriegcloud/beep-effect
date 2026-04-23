# Blocker Protocol

Classify blockers with the following taxonomy and record the taxonomy id in the
review loop and manifest.

| ID | Trigger | Blocks closure until |
| --- | --- | --- |
| `missing-source-artifact` | a required source artifact, design doc, prior evidence pack, or ledger is missing | the missing source is restored or an explicit escalation path is recorded |
| `missing-route-or-owner` | a live surface has no owner, destination, or migration batch | route and ownership are explicit |
| `unowned-consumer-importer` | a consumer or importer count is missing, inferred, or ownerless | consumer/importer census data is explicit |
| `architecture-invalid-route` | a route conflicts with `standards/ARCHITECTURE.md` | the route is fixed or governed in `ops/architecture-amendment-register.md` |
| `ungoverned-temporary-exception` | an alias, shim, allowlist entry, or route exception lacks owner, issue, or deletion phase | governance data is complete in the authoritative ledger |
| `required-command-failed` | any mandatory command gate fails | the command passes or the phase is explicitly blocked |
| `required-search-audit-missing` | search proof is missing, imprecise, or stale | exact search commands and counts are recorded |
| `graphiti-obligation-unmet` | Graphiti bootstrap or writeback was required but neither succeeded nor was explicitly skipped | bootstrap and writeback status is recorded |
| `stale-evidence` | the evidence pack predates the last material repo change | fresh proof is rerun and recorded |
| `narrative-only-output` | the phase describes intended work without landed repo changes | repo changes are landed or the phase remains incomplete |

## Handling Rules

- Any blocker with one of the taxonomy ids above prevents `completed`.
- Record owner, impact, attempted remediation, and next action.
- If the blocker is a lasting constitution conflict, add or update an entry in
  `ops/architecture-amendment-register.md`.
- If the blocker is a temporary compatibility surface, add or update an entry
  in `ops/compatibility-ledger.md`.
