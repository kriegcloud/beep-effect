# Hosted acceptance probes, 2026-10-22

Refs #1858. This is an evidence receipt for the remaining workstream E audit,
not a declaration that every acceptance gate passed. No workflow, repository
secret, token, environment, inventory or baseline changed in this lane.

The source checklist is [the E audit](stage-4-github-audit.md) and its
[final handoff](../handoffs/rsc-e-github-2026-10-09.md). Rows already supported
by that handoff retain their historical disposition. The table below includes
all 33 rows so an unexecuted probe cannot disappear from the follow-up.

## Exact heads and hosted evidence

The head aliases below identify full commit SHAs, not moving branches.

| Alias | Exact head | Run and event |
| --- | --- | --- |
| M | `74d3625ad0fe1a61cd2f3d003fc13191b7ba4d00` | [Check 39761207774](https://github.com/beep-effect/beep-effect/actions/runs/39761207774), main push after merge of #2027, completed/failure |
| P | `f0ce92b09f6f26daa224ef184d9d007c34e4f2d2` | [Check 39779040740](https://github.com/beep-effect/beep-effect/actions/runs/39779040740), PR #2039, individual jobs below completed/success |
| N | `cf68c1d953bae912450825c5352cf1fc92297ad4` | [Property Laws Nightly 39779966274](https://github.com/beep-effect/beep-effect/actions/runs/39779966274), workflow_dispatch on main, requested by this lane with the existing 1000-run floor, completed/success |
| S | `ab606411ed2f842f1a06347d527b32d6a646df63` | [Property Laws Nightly 39617181038](https://github.com/beep-effect/beep-effect/actions/runs/39617181038), 2026-10-21 schedule, completed/success |
| B | `4ab30dac3e7f6e5baaac4f14fc632dcb409aed59` | [Storybook 39776970873](https://github.com/beep-effect/beep-effect/actions/runs/39776970873), main push, completed/success |
| R | `3715b909c7299dbdbf753ba4ef0cebc33c05d4bc` | [Rerun Runner Loss 39772755412](https://github.com/beep-effect/beep-effect/actions/runs/39772755412), workflow_run, completed/success; inspects M, attempt 1 |

REST run metadata for M records the reusable workflow
`beep-effect/beep-effect/.github/workflows/heavy.yml@main` resolved to M itself.
The commit API identifies M as the squash merge of #2027. This establishes
exact-merge-SHA workflow execution, including its failures.

REST observations were collected on 2026-10-22 between 12:37 and 13:05 UTC.
Pending-run observations in the audit are snapshots from that interval.

## Audit reconciliation

"Historical" means the prior audit supplied the evidence. It is not a fresh
hosted pass. "Not run" means no qualifying execution was established by this
receipt. Settings readbacks have no execution SHA or run ID.

| E item | Exact head / run | Result and attribution |
| --- | --- | --- |
| E-01, main concurrency | M / 39761207774; current-main Check 39779325986 at N | M terminated/failure rather than remaining held. The successor at N was pending on the read. End-to-end queue drainage remains open; existing red lanes are owned by the main repair program. |
| E-02, trusted writer boundary / R41 | M / 39761207774; P / 39779040740 | Main writer deployment succeeded; PR Build had no writer input or deployment and ran remote read-only. Operational boundary demonstrated below. Repository token retirement and proof after retirement remain open. |
| E-03, nightly credentials | S / 39617181038; N / 39779966274 | Scheduled execution passed after 2026-10-21. The manual dispatch at N also completed/success; terminal details are below. No credentials were provisioned. Data Sync remains disabled. |
| E-04, required declarations | No execution SHA/run; live ruleset check | Read-only `ci ruleset --check` result recorded below. Old 16-context counts are historical, not an assertion about the current ruleset. |
| E-05, dependency review | P / 39779040740, Security job 119825840059 | Job and its Dependency review and Check hosted settings policy steps completed/success under the actual PR job token. |
| E-06, Knip retirement | No new hosted probe | Historical coordinated retirement obligation belongs to the program. Current ruleset check tests descriptor agreement; no ruleset, job or inventory changed here. |
| E-07, size labels | P / 39779040740, job 119825840043 | PR Size Label completed/success; #2039 readback has exactly one size label, `size/S`, plus `ready-for-heavy`. |
| E-08, Storybook artifacts | B / 39776970873 | Push completed/success. Artifact 12425457647, `storybook-static`, created 2026-10-22, expires 2026-11-21, demonstrates the 30-day push lifetime. Seven-day PR retention and cancellation behavior were not newly exercised. |
| E-09, desktop release | No qualifying release run | Not run: needs desktop signing material and release-owner action. Historical protected-environment setup is not a signed release proof. No release was dispatched. |
| E-10, Data Sync | No execution SHA/run; workflow registry | Registration 253196863 is `disabled_manually`. No dispatch or re-enable; previous hosted disable remains in effect. |
| E-11, Cache Warm | No new qualifying run | Not run: needs a dedicated trusted-writer recovery run and cache-owner acceptance. Existing dispatch consumes the environment writer credential; this lane did not start it under the no-secret probe constraint. The latest listed warm run, 38727710945 at `764a3e2942ab856a39d7934b5b60d29cf439f394`, failed before this evidence window. M's remote hits do not prove a cold warm/recovery pass. |
| E-12, docs-only classifier | M / 39761207774 | Heavy Build, Check, Docgen, Doctest and Integration executed successfully on a source-changing merge. Not run: needs hosted docs-only and application-Markdown event cases to requalify the classifier matrix. |
| E-13, fork admission | No qualifying fork run | Not run: needs a real fork PR and the two distinct approval events. Same-repository P cannot establish fork behavior. No approval labels were changed. |
| E-14, writer environments | M / 39761207774; P / 39779040740 | The complete SHA-filtered deployment list has 14 records. Its four Heavy attachments are Build, Check, Doctest and Test Integration; none names Lint Policy, Effect Diagnostics or Docgen. PR head P has zero writer deployments. This qualifies the sampled main/PR attachment boundary; token retirement remains open. |
| E-15, app secrets / Cachix | M / 39761207774; P / 39779040740 | Build exporter logs distinguish trusted-push app export from PR blank app secrets. No separate Cachix signing/write operation was attempted; historical removal evidence remains in the audit. |
| E-16, setup cache writes / Bun cache | M / 39761207774 | Downloaded Turbo summaries prove remote hits, not local Actions-cache cleanup or Bun-cache absence across every job. Not run: needs cache-owner before/after usage and recoverable cleanup receipt. |
| E-17, ghost repo-law | No execution SHA/run; workflow registry | Registration 231729043 remains `disabled_manually`. No re-enable or dispatch. |
| E-18, Impeccable residue | No new hosted probe | Historical cross-lane source-removal obligation. No removal or consumer edit here; this receipt does not requalify it. |
| E-19, action allowlist | No new hosted probe | Historical backed-up allowlist change remains in the E receipt. No allowlist mutation or new claim about every current entry. |
| E-20, runner group | M / 39761207774 | Reusable Heavy jobs were scheduled and executed through `heavy.yml@main` resolved to M. Existing runner-group acceptance remains historical; no group policy was changed. |
| E-21, permissions | P / 39779040740, Security 119825840059, SAST 119825840260 | Both jobs completed/success. Security step metadata also confirms Dependency review and hosted settings policy completed/success; no broader token-scope claim is inferred. |
| E-22, timeouts | No timeout probe | Historical workflow bounds. Not run: needs a controlled timeout case if operational timeout acceptance is required. No job was deliberately hung or cancelled. |
| E-23, checkout credentials | N / 39779966274 | Nightly checkout completed/success. `persist-credentials: false` remains workflow configuration evidence; success alone does not prove credential-file absence after checkout. |
| E-24, action pins / updater | M / 39761207774; B / 39776970873 | Existing jobs executed with the pinned actions. No Dependabot update was forced; updater behavior remains outside this probe. |
| E-25, main-ref trust | M / 39761207774; P / 39779040740 | Export logs show trusted push read-write and PR read-only. Forged push-ref rejection was not exercised on GitHub; historical matrix tests do not replace that hosted probe. |
| E-26, orphan secrets / environments / Vercel | No qualifying recovery run | Not run: needs each secret's verified recovery source and Vercel binding-owner evidence. Names-only inventory cannot restore values or establish an unused binding. Nothing deleted or rotated. |
| E-27, ruleset hardening | No execution SHA/run; live ruleset check | Read-only agreement check recorded below; historical hardening snapshot remains the recovery source. No ruleset mutation. |
| E-28, Heavy Admit replacement | P / 39779040740 | Heavy Admission and reusable jobs ran. Not run: needs the controlled pending-label replacement sequence; normal admission does not prove concurrency replacement. |
| E-29, PR workflow trust | P / 39779040740 | Same-repository read-only execution observed. Historical single-operator trust decision is unchanged; no independent-contributor security guarantee is claimed. |
| E-30, workflow descriptors | No execution SHA/run; live ruleset and workflow-lint checks | Read-only check results below supplement historical inventory proof. No generated declaration edited. |
| E-31, merge-SHA Heavy | M / 39761207774 | Exact merge SHA and reusable-workflow SHA agree. Five original matrix lanes passed; Lint Policy and Effect Diagnostics failed. Coverage Regression also failed. All-green acceptance remains unmet; failure attribution is below. |
| E-32, caller secret boundary | M / 39761207774; P / 39779040740 | Actual exporter logs show the guarded writer input on push and blank writer input on PR. Environment-only secret storage remains incomplete until the operator retires the repository token. |
| E-33, admission comment | No new hosted probe | Historical documentation change. This lane did not manufacture label events to test the comment's explanation. |

## Writer and cache proof

Read-only REST inspection of `environments/turbo-cache-write` reports custom
branch policies, with exactly one policy, branch `main`. The latest 100
writer deployment records all have ref `main`. This is a bounded sample,
not an all-history assertion.

[Deployment 7249922175](https://api.github.com/repos/beep-effect/beep-effect/deployments/7249922175)
has ref `main`, SHA M, environment `turbo-cache-write`, and a terminal success
status linked to [Heavy / Build 119775578760](https://github.com/beep-effect/beep-effect/actions/runs/39761207774/job/119775578760).
That job's exporter reports `turbo remote cache read-write (trusted push)`;
its execution environment uses `TURBO_CACHE: local:rw,remote:rw`.

The complete SHA-filtered writer deployment response contained 14 records,
below its 100-record page limit. Mapping their status log URLs to the run's
jobs identifies Heavy Check, Test Integration, Doctest and Build as the four
Heavy attachments. Lint Policy, Effect Diagnostics and Docgen have none.
The other records belong to non-Heavy jobs, including an earlier run at M.
This census proves the attachment matrix for M without treating source fixtures
as hosted execution.

The same run's artifact 12418329636, `turbo-summary-verify-build`, was downloaded
and parsed. Its summary's SCM SHA is M and branch is `main`. Among 176 tasks,
123 have `status=HIT`, `local=false`, `remote=true`; 53 have `status=MISS`.
For example, `@beep/acp#build`, hash `f6dbd8bee9091346`, has source `REMOTE`.
The downloaded file is `3L2wWfgpliT0Y1D6CN2zCV2hnmF.json`, SHA-256
`fd55f39bda285e9d7ee86a51e84c1991c224d26e54f913d328bd0e5e73fc05c2`.
This proves remote reuse at that exact head. It does not prove that each miss
was uploaded, or that large artifacts previously rejected with HTTP 413 now fit.
The artifact was available and unexpired on the read; its hosted retention is
finite. Re-download while available with:

```bash
gh run download 39761207774 -R beep-effect/beep-effect \
  -n turbo-summary-verify-build -D .beep/hosted-probes/main-build-summary
```

[PR Heavy / Build 119826513181](https://github.com/beep-effect/beep-effect/actions/runs/39779040740/job/119826513181)
at P completed/success. Its logs show a blank writer input,
`turbo remote cache read-only (same-repository pull request); application secrets blank`,
and `TURBO_CACHE: local:rw,remote:r`. The deployments API filtered by P and
`turbo-cache-write` returns zero records. The evidence establishes this PR's
operational boundary; it does not establish the behavior of every possible
PR-controlled workflow while the repository writer secret still exists.

The names-only secret inventories report `TURBO_TOKEN` at both repository and
environment scope. GitHub does not disclose secret values or the provenance
of a resolved expression. The attachment, branch restriction and successful
writer execution are demonstrated. Exclusive environment-only storage and a
successful writer run after repository-token deletion are still open.

## Heavy failures and recovery

M's original seven reusable matrix jobs have these outcomes:

| Job | ID | Result |
| --- | --- | --- |
| Build | 119775578760 | success |
| Check | 119775578834 | success |
| Docgen | 119775578877 | success |
| Doctest | 119775578768 | success |
| Test Integration | 119775578896 | success |
| Lint Policy | 119775578668 | failure |
| Effect Diagnostics | 119775578739 | failure |

The additional Coverage Regression job 119796165723 failed. Completed red
logs were read directly through `gh api --allow-escape-sequences .../logs`.
Lint Policy's failed medium step names `@beep/utils#lint:laws` and
`knowledge:refs-check`; the utils log identifies a native TypeError in
`Str.ts`. Effect Diagnostics reports seven `preferEffectArray` findings.
Coverage reports regressions in existing packages, including ACP,
codegen-kit and epistemic-domain. These failures predate this docs-only lane
and belong to the program's consolidated main repairs. No floor or exception
was changed. A future all-green exact-merge-SHA run is still required by
[the hosted settings runbook](../../../../docs/runbooks/ci-hosted-settings.md).

[Rerun Runner Loss job 119804098110](https://github.com/beep-effect/beep-effect/actions/runs/39772755412/job/119804098110)
at R executed the recovery command against M, attempt 1. It returned
`skipped (no-runner-loss)` and explicitly left the three red jobs alone because
they failed for other reasons. The workflow completed/success. This proves
conservative recovery classification, not recovery after an actual dead runner.
No deliberate runner failure, Vercel rebind, orphan deletion or credential
restoration was performed. Those probes need the fleet/cache/binding owners
and their existing recovery procedures.

## Nightly dispatch and read-only checks

The lane dispatched only the existing `property-laws-nightly.yml` workflow on
main, with `runs=1000`. It uses its existing read credential; no secret read,
provisioning, rotation or environment change was performed by this lane.
The scheduled S run passed. Dispatch N completed/success at 13:03:55 UTC.
[Property Laws Sweep job 119828408748](https://github.com/beep-effect/beep-effect/actions/runs/39779966274/job/119828408748)
passed setup, the full sweep and Turbo summary append. The failure-tracking
step correctly skipped. Its log records `BEEP_PROPERTY_RUNS: 1000`, seed
`1125260628`, 86 successful tasks out of 86, and zero cached tasks. The exporter
reports `turbo remote cache local-only; application secrets not requested`.
This qualifies dispatch execution and its local-only policy; it does not
claim a nightly remote-cache hit.

Read-only `bun run beep ci ruleset --check` passed with
`declared contexts match live GitHub settings`. `ci settings --check` passed
with `desktop release reviewer protection present`. `ci workflow-lint` passed
with `clean`. These are checks of current configuration, not hosted execution
or signing-material proof.

Publication gates for this docs-only change: `bun run lint:oxlint` passed
with zero findings; `bun run beep quality changeset-graph` passed with zero
missing references; `bun run beep knowledge refs --check` passed with zero
live gated observations. No workspace package, test or export changed, so
package verification, test-tsgo and docgen are not applicable.

## Token retirement

Deleting the repository-level `TURBO_TOKEN` is an operator step. This lane did
not delete, rotate, overwrite or test-write any repository or environment
secret. Keep the `turbo-cache-write` environment token and branch policy.

Before deletion, the cache owner must identify and verify the existing
1Password reference for the trusted writer credential, and preserve that
reference in the operator's private recovery record. The checkout `.env`
reference is the read-only token and must not be used to restore writer access.
No exact writer reference or successful recovery read was established here;
this is an explicit pre-deletion hold, not a verified secret backup.

The operator can recreate the repository secret by streaming the verified
writer value from that reference directly into GitHub. With `WRITER_TOKEN_REF`
set privately to the verified `op://` reference, the restoration procedure is:

```bash
python - <<'PYTHON'
import os
import subprocess

try:
    writer = subprocess.check_output(["op", "read", os.environ["WRITER_TOKEN_REF"]])
except subprocess.CalledProcessError:
    subprocess.run(["op-doctor"], check=False)
    raise SystemExit("Recovery read failed; stop without changing GitHub.")
if not writer.strip():
    raise SystemExit("Recovery read was empty; stop without changing GitHub.")
subprocess.run(
    ["gh", "secret", "set", "TURBO_TOKEN", "-R", "beep-effect/beep-effect"],
    input=writer,
    check=True,
)
PYTHON
```

These commands describe recovery; they were not executed. Resolve `op` from
PATH. On a failure, run `op-doctor` once, use its count/type/mode-only output,
and stop if the exact operation still fails. Never print the value, use
`--reveal`, write it to disk or request Desktop sign-in for an agent path.
After restoration, verify only the secret name, then validate a trusted-main
writer deployment and a PR read-only run at recorded exact heads. Restoring
repository scope reopens its former exposure, so retain that incident receipt
until environment-only operation is qualified again.

Before retiring the repository copy, the operator must resolve the recovery
reference hold and review the still-open acceptance rows above. After deletion,
read the repository/environment secret-name lists and repeat both hosted
boundary probes. Until then #1858 stays open.
