# Agent spot-check of the attorney's tags, and contact evidence on

Run on 2026-10-14 by the operator's session, under the S15 ruling (attorney evals run as an agent pipeline;
only unresolved items reach the attorney). This replaces the attorney's own spot-check named in P2 and D-46.
Counts only; no message, address, subject, or matter key is recorded. The private evidence (export, second
reading, comparison, write journal) stays outside the repository in the operator's corpus home.

| Step | Result |
| --- | --- |
| Scope | Every tag decision in both ledgers: 380 (36 live service, 344 backfill); 334 matter tags, 46 unmatched (`P:` categories) |
| Export | 380 of 380 messages read, read-only, through the existing app registration; 0 missing |
| Second reading | An independent model (Codex, `gpt-6.1-sol` medium) assigned each message one matter from the matter directory (158 matters), or none, without seeing the service's tags |
| Agreement | 351 / 380 (92.4%) |
| Different matter | 0 |
| Service tagged, second reading found none | 17: 14 thread replies whose matter evidence sits in an earlier message of the thread (the second reading saw single messages; the service's thread evidence is correct), 3 client-wide messages (invoices, client updates) tagged to one matter |
| Service unmatched, second reading found a matter | 12, each with an explicit docket number in the subject or body, high confidence |
| Attorney questions | 0 |

Corrections (operator-approved; each write conditional on the message's change key, prior categories journaled
for reversal; the unit stopped during the writes):

- 12 missed messages: matter category added, `P: Unmatched - review` removed (`P: USPTO` kept on 2).
- 3 client-wide messages: matter category replaced with `P: Client`.
- A re-run of the plan reported all 15 unchanged (already in the target state).

Then contact evidence was switched on (D-49) and the unit restarted; its first pass finished without error.

Gap the spot-check exposes: an explicit docket number in the text did not always produce a match (12 of 46
unmatched). Likely cause: the earlier KG bundle (`-03`) lacked those matters; D-49 moves to `-04`. Re-check the
unmatched share after a week of live passes before opening a matcher change.
